/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";


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
            const session = event.data.object 

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
                const session = event.data.object

                console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
                break;

        }
        case "payment_intent.payment_failed" : {
            const session = event.data.object

            console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
            break;
        }
        default :
            console.log(`Unhandled event type ${event.type}`);
    }

    return {message : `Webhook Event ${event.id} processed successfully`}
}

export const PaymentService = {
    handlerStripeWebhookEvent
}