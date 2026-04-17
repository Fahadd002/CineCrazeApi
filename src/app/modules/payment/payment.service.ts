/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import status from "http-status";
import { AccessType, PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { prisma } from "../../lib/prisma";

const createCheckoutSession = async (viewerId: string, contentId: string) => {
    const viewer = await prisma.viewer.findUnique({
        where: { userId: viewerId },
    });

    if (!viewer) {
        throw new AppError(status.NOT_FOUND, "Viewer record not found for current user.");
    }

    const content = await prisma.content.findUnique({
        where: { id: contentId },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found.");
    }

    if (!content.ticketPrice || content.ticketPrice <= 0) {
        throw new AppError(status.BAD_REQUEST, "Content does not have a valid ticket price.");
    }

    if (content.accessType === AccessType.FREE || content.accessType === AccessType.SUBSCRIPTION) {
        throw new AppError(status.BAD_REQUEST, "This content is not available for ticket purchase.");
    }

    const existingTicket = await prisma.ticket.findFirst({
        where: {
            viewerId: viewer.id,
            contentId: content.id,
        },
        include: {
            payment: true,
        },
    });

    let ticket = existingTicket;

    if (ticket && ticket.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, "Ticket already purchased for this content.");
    }

    if (!ticket) {
        ticket = await prisma.ticket.create({
            data: {
                viewer: { connect: { id: viewer.id } },
                content: { connect: { id: content.id } },
                paymentStatus: PaymentStatus.PENDING,
            },
            include: {
                payment: true,
            },
        });
    } else {
        ticket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: { paymentStatus: PaymentStatus.PENDING },
            include: { payment: true },
        });
    }

    let payment = ticket.payment;

    if (!payment) {
        payment = await prisma.payment.create({
            data: {
                transactionId: uuidv4(),
                amount: content.ticketPrice,
                status: PaymentStatus.PENDING,
                purpose: "TICKET_PURCHASE",
                viewer: { connect: { id: viewer.id } },
                ticket: { connect: { id: ticket.id } },
            },
        });
    } else if (payment.status !== PaymentStatus.PENDING) {
        payment = await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.PENDING },
        });
    }

    const stripeClient = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

    const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: content.title,
                        description: content.description || undefined,
                    },
                    unit_amount: Math.round(content.ticketPrice * 100),
                },
                quantity: 1,
            },
        ],
        customer_email: viewer.email,
        metadata: {
            ticketId: ticket.id,
            paymentId: payment.id,
        },
        success_url: `${envVars.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.FRONTEND_URL}/payment-canceled`,
    });

    return {
        url: session.url,
        sessionId: session.id,
        ticketId: ticket.id,
        paymentId: payment.id,
    };
};

const handlerStripeWebhookEvent = async (event : Stripe.Event) =>{

    const existingPayment = await prisma.payment.findFirst({
        where:{
            stripeEventId : event.id
        }
    })

    if(existingPayment){
        console.log(`Event ${event.id} already processed. Skipping`);
        return {message : `Event ${event.id} already processed. Skipping`}
    }

    switch(event.type){
        case "checkout.session.completed" : {
            const session = event.data.object as Stripe.Checkout.Session;

            const ticketId = session.metadata?.ticketId
            const paymentId = session.metadata?.paymentId

            if(!ticketId || !paymentId){
                console.error("Missing ticketId or paymentId in session metadata");
                return {message : "Missing ticketId or paymentId in session metadata"}
            }

            const ticket = await prisma.ticket.findUnique({
                where : {
                    id : ticketId
                }
            })

            if(!ticket){
                console.error(`Ticket with id ${ticketId} not found`);
                return {message : `Ticket with id ${ticketId} not found`}
            }

            await prisma.$transaction(async (tx) => {
                await tx.ticket.update({
                    where : {
                        id : ticketId
                    },
                    data : {
                        paymentStatus : session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                    }
                });

                await tx.payment.update({
                    where : {
                        id : paymentId
                    },
                    data : {
                        stripeEventId : event.id,
                        status : session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData : session as any,
                    }
                });
            });

            console.log(`Processed checkout.session.completed for ticket ${ticketId} and payment ${paymentId}`);
            break;
        }
        case "checkout.session.expired" : {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.FAILED,
                        paymentGatewayData: session as any,
                    },
                });
            }

            console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
            break;

        }
        case "payment_intent.payment_failed" : {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const paymentId = paymentIntent.metadata?.paymentId as string | undefined;

            if (paymentId) {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.FAILED,
                        paymentGatewayData: paymentIntent as any,
                    },
                });
            }

            console.log(`Payment intent ${paymentIntent.id} failed. Marking associated payment as failed.`);
            break;
        }
        default :
            console.log(`Unhandled event type ${event.type}`);
    }

    return {message : `Webhook Event ${event.id} processed successfully`}
}

export const PaymentService = {
    handlerStripeWebhookEvent,
    createCheckoutSession,
}