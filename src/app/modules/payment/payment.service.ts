/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import status from "http-status";
import { AccessType, PaymentStatus, SubscriptionPlan } from "../../../generated/prisma/enums";
import type { Viewer, Subscription } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { prisma } from "../../lib/prisma";

interface SubscriptionPlanDetails {
    amount: number;
    days: number;
}

const createCheckoutSession = async (viewerId: string, payload: { type: "TICKET" | "SUBSCRIPTION"; contentId?: string; plan?: string }) => {
    const viewer = await prisma.viewer.findUnique({
        where: { userId: viewerId },
    });

    if (!viewer) {
        throw new AppError(status.NOT_FOUND, "Viewer record not found for current user.");
    }

    if (payload.type === "TICKET") {
        return await handleTicketCheckout(viewer, payload.contentId!);
    } else if (payload.type === "SUBSCRIPTION") {
        return await handleSubscriptionCheckout(viewer, payload.plan!);
    }

    throw new AppError(status.BAD_REQUEST, "Invalid payment type");
};

const handleTicketCheckout = async (viewer: Viewer, contentId: string) => {
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

    if (ticket && ticket.payment && ticket.payment.status === PaymentStatus.PAID) {
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
        console.log(`[CHECKOUT] Creating new payment for ticket ${ticket.id}`);
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
    } else {
        // IMPORTANT: Always reuse existing PENDING payment instead of creating new ones
        // This prevents multiple payments for the same ticket
        if (payment.status === PaymentStatus.PENDING) {
            console.log(`[CHECKOUT] Reusing existing PENDING payment ${payment.id} for ticket ${ticket.id}`);
            // Keep the existing payment, don't create or update
        } else {
            console.log(`[CHECKOUT] Resetting payment ${payment.id} status from ${payment.status} to PENDING`);
            payment = await prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.PENDING },
            });
        }
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

const handleSubscriptionCheckout = async (viewer: Viewer, plan: string) => {
    const subscriptionPlans: Record<string, SubscriptionPlanDetails> = {
        PREMIUM_MONTHLY: { amount: 9.99, days: 30 },
        PREMIUM_YEARLY: { amount: 99.99, days: 365 },
    };

    const planDetails = subscriptionPlans[plan];
    if (!planDetails) {
        throw new AppError(status.BAD_REQUEST, "Invalid subscription plan.");
    }

    let subscription: Subscription | null;
    let purpose: "SUBSCRIPTION_PURCHASE" | "SUBSCRIPTION_RENEWAL";

    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            viewerId: viewer.id,
            status: PaymentStatus.PAID,
            endDate: { gte: new Date() },
        },
    });

    if (existingSubscription) {
        purpose = "SUBSCRIPTION_RENEWAL";
        subscription = existingSubscription;
    } else {
        purpose = "SUBSCRIPTION_PURCHASE";
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planDetails.days);

        const created = await prisma.subscription.create({
            data: {
                viewerId: viewer.id,
                plan: plan as SubscriptionPlan,
                amount: planDetails.amount,
                endDate: endDate,
                status: PaymentStatus.PENDING,
                autoRenew: false,
            },
        });
        subscription = created;
    }

    if (!subscription) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create or retrieve subscription");
    }

    const paymentAmount = planDetails.amount;

    // Check if there's already a PENDING payment for this subscription
    const existingPayment = await prisma.payment.findFirst({
        where: {
            subscriptionId: subscription.id,
            status: PaymentStatus.PENDING,
        },
    });

    const payment = existingPayment || await prisma.payment.create({
        data: {
            transactionId: uuidv4(),
            amount: paymentAmount,
            status: PaymentStatus.PENDING,
            purpose: purpose,
            viewer: { connect: { id: viewer.id } },
            subscription: { connect: { id: subscription.id } },
            ticketId: null,
        } as any,
    });

    if (existingPayment) {
        console.log(`[CHECKOUT] Reusing existing PENDING payment ${payment.id} for subscription ${subscription.id}`);
    } else {
        console.log(`[CHECKOUT] Created new payment ${payment.id} for subscription ${subscription.id}`);
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
                        name: `${plan} Subscription`,
                        description: `Access to CineCraze ${plan.replace("_", " ").toLowerCase()} features`,
                    },
                    unit_amount: Math.round(planDetails.amount * 100),
                },
                quantity: 1,
            },
        ],
        customer_email: viewer.email,
        metadata: {
            subscriptionId: subscription.id,
            paymentId: payment.id,
        },
        success_url: `${envVars.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.FRONTEND_URL}/payment-canceled`,
    });

    return {
        url: session.url,
        sessionId: session.id,
        subscriptionId: subscription.id,
        paymentId: payment.id,
    };
};

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[WEBHOOK] 📨 Received webhook event`);
    console.log(`[WEBHOOK] Type: ${event.type}`);
    console.log(`[WEBHOOK] ID: ${event.id}`);
    console.log(`[WEBHOOK] Created: ${new Date(event.created * 1000).toISOString()}`);
    console.log(`${'═'.repeat(60)}`);

    // Prevent duplicate processing
    const existingPayment = await prisma.payment.findFirst({
        where: {
            stripeEventId: event.id,
        },
    });

    if (existingPayment) {
        console.log(`[WEBHOOK] ⏭️  Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            const ticketId = session.metadata?.ticketId;
            const paymentId = session.metadata?.paymentId;
            const subscriptionId = session.metadata?.subscriptionId;

            if (!paymentId) {
                console.error("Missing paymentId in session metadata");
                return { message: "Missing paymentId in session metadata" };
            }

            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    ticket: true,
                    subscription: true,
                    viewer: true,
                },
            });

            if (!payment) {
                console.error(`Payment with id ${paymentId} not found`);
                return { message: `Payment with id ${paymentId} not found` };
            }

            if (payment.purpose === "TICKET_PURCHASE") {
                if (!ticketId) {
                    console.error("Missing ticketId in session metadata for ticket purchase");
                    return { message: "Missing ticketId in session metadata" };
                }

                console.log(`[WEBHOOK] Ticket purchase detected. ticketId=${ticketId}, paymentId=${paymentId}, session.payment_status=${session.payment_status}`);
                console.log(`[WEBHOOK] Payment record:`, {
                    id: payment.id,
                    purpose: payment.purpose,
                    status: payment.status,
                    ticketId: payment.ticketId,
                    viewerId: payment.viewerId
                });

                try {
                    const newStatus = session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID;
                    console.log(`[WEBHOOK] Will set ticket status to: ${newStatus}`);

                    await prisma.$transaction(async (tx) => {
                        const ticketUpdate = await tx.ticket.update({
                            where: { id: ticketId },
                            data: {
                                paymentStatus: newStatus,
                            },
                        });
                        console.log(`[WEBHOOK] Ticket updated successfully:`, { id: ticketUpdate.id, paymentStatus: ticketUpdate.paymentStatus });

                        const paymentUpdate = await tx.payment.update({
                            where: { id: paymentId },
                            data: {
                                stripeEventId: event.id,
                                status: newStatus,
                                paymentGatewayData: session as any,
                            },
                        });
                        console.log(`[WEBHOOK] Payment updated successfully:`, { id: paymentUpdate.id, status: paymentUpdate.status, stripeEventId: paymentUpdate.stripeEventId });
                    });

                    console.log(`[WEBHOOK] Transaction committed successfully`);
                } catch (txError: any) {
                    console.error("[WEBHOOK] TRANSACTION FAILED:", {
                        error: txError.message,
                        code: txError.code,
                        meta: txError.meta,
                        stack: txError.stack
                    });
                    throw txError;
                }

                console.log(`[WEBHOOK] ✓ Processed ticket payment for ticket ${ticketId} and payment ${paymentId}`);
            } else if (payment.purpose === "SUBSCRIPTION_PURCHASE" || payment.purpose === "SUBSCRIPTION_RENEWAL") {
                if (!subscriptionId) {
                    console.error("[WEBHOOK] ❌ Missing subscriptionId in session metadata for subscription");
                    return { message: "Missing subscriptionId in session metadata" };
                }

                console.log(`[WEBHOOK] 🔄 SUBSCRIPTION ${payment.purpose} - Processing subscription payment...`);
                console.log(`  Subscription ID: ${subscriptionId}`);

                const subscriptionPlanMap: Record<string, number> = {
                    PREMIUM_MONTHLY: 30,
                    PREMIUM_YEARLY: 365,
                };

                const newStatus = session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID;
                console.log(`[WEBHOOK] 🔄 Updating status from ${payment.status} to ${newStatus}`);

                await prisma.$transaction(async (tx) => {
                    if (payment.purpose === "SUBSCRIPTION_RENEWAL" && newStatus === PaymentStatus.PAID) {
                        console.log(`[WEBHOOK] 🔄 Processing subscription renewal...`);
                        const existingSubscription = await tx.subscription.findUnique({
                            where: { id: subscriptionId },
                        });

                        if (existingSubscription) {
                            const daysToAdd = subscriptionPlanMap[existingSubscription.plan as keyof typeof subscriptionPlanMap] || 30;
                            const newEndDate = new Date(existingSubscription.endDate);
                            newEndDate.setDate(newEndDate.getDate() + daysToAdd);

                            await tx.subscription.update({
                                where: { id: subscriptionId },
                                data: {
                                    status: PaymentStatus.PAID,
                                    endDate: newEndDate,
                                },
                            });

                            await tx.viewer.update({
                                where: { id: payment.viewerId },
                                data: {
                                    subscriptionEnds: newEndDate,
                                },
                            });

                            console.log(`[WEBHOOK] ✅ Subscription renewed: { endDate: ${newEndDate.toISOString()}, daysAdded: ${daysToAdd} }`);
                        }
                    } else {
                        console.log(`[WEBHOOK] 🔄 Updating subscription status to ${newStatus}...`);
                        await tx.subscription.update({
                            where: { id: subscriptionId },
                            data: {
                                status: newStatus,
                            },
                        });

                        if (newStatus === PaymentStatus.PAID && payment.viewer) {
                            const subscription = await tx.subscription.findUnique({
                                where: { id: subscriptionId },
                            });

                                if (subscription) {
                                    await tx.viewer.update({
                                        where: { id: payment.viewerId },
                                        data: {
                                            subscriptionPlan: subscription.plan as SubscriptionPlan,
                                            subscriptionEnds: subscription.endDate,
                                        },
                                    });
                                    console.log(`[WEBHOOK] ✅ Viewer subscription updated: { plan: ${subscription.plan}, ends: ${subscription.endDate.toISOString()} }`);
                                }
                        }
                    }

                    await tx.payment.update({
                        where: { id: paymentId },
                        data: {
                            stripeEventId: event.id,
                            status: newStatus,
                            paymentGatewayData: session as any,
                        },
                    });
                });

                console.log(`[WEBHOOK] ✅ Subscription payment processed: subscription ${subscriptionId}, status ${newStatus}`);
            } else {
                console.log(`[WEBHOOK] ⚠️  Unknown payment purpose: ${payment.purpose}. Updating payment status only...`);
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        stripeEventId: event.id,
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session as any,
                    },
                });
            }

            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentId = session.metadata?.paymentId;

            console.log(`[WEBHOOK] ⏱️  CHECKOUT SESSION EXPIRED`);
            console.log(`  Session ID: ${session.id}`);
            console.log(`  Payment ID: ${paymentId}`);

            if (paymentId) {
                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: { subscription: true },
                });

                if (payment) {
                    console.log(`[WEBHOOK] 🔄 Marking payment as FAILED...`);
                    await prisma.$transaction(async (tx) => {
                        await tx.payment.update({
                            where: { id: paymentId },
                            data: {
                                status: PaymentStatus.FAILED,
                                paymentGatewayData: session as any,
                            },
                        });

                        // If it's an initial subscription purchase that expired, mark subscription as failed
                        if (payment.purpose === "SUBSCRIPTION_PURCHASE" && payment.subscription) {
                            await tx.subscription.update({
                                where: { id: payment.subscriptionId as string },
                                data: { status: PaymentStatus.FAILED },
                            });
                            console.log(`[WEBHOOK] ✅ Subscription marked as FAILED: ${payment.subscriptionId}`);
                        }
                    });
                    console.log(`[WEBHOOK] ✅ Payment marked as FAILED: ${paymentId}`);
                } else {
                    console.warn(`[WEBHOOK] ⚠️  Payment not found for ID: ${paymentId}`);
                }
            } else {
                console.warn(`[WEBHOOK] ⚠️  No paymentId in session metadata`);
            }

            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const paymentId = paymentIntent.metadata?.paymentId as string | undefined;

            console.log(`[WEBHOOK] ❌ PAYMENT INTENT FAILED`);
            console.log(`  Payment Intent ID: ${paymentIntent.id}`);
            console.log(`  Payment ID: ${paymentId}`);
            console.log(`  Reason: ${paymentIntent.last_payment_error?.message}`);

            if (paymentId) {
                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                    include: { subscription: true },
                });

                if (payment) {
                    console.log(`[WEBHOOK] 🔄 Marking payment as FAILED...`);
                    await prisma.$transaction(async (tx) => {
                        await tx.payment.update({
                            where: { id: paymentId },
                            data: {
                                status: PaymentStatus.FAILED,
                                paymentGatewayData: paymentIntent as any,
                            },
                        });

                        // If it's an initial subscription purchase that failed, mark subscription as failed
                        if (payment.purpose === "SUBSCRIPTION_PURCHASE" && payment.subscription) {
                            await tx.subscription.update({
                                where: { id: payment.subscriptionId as string },
                                data: { status: PaymentStatus.FAILED },
                            });
                            console.log(`[WEBHOOK] ✅ Subscription marked as FAILED: ${payment.subscriptionId}`);
                        }
                    });
                    console.log(`[WEBHOOK] ✅ Payment marked as FAILED: ${paymentId}`);
                } else {
                    console.warn(`[WEBHOOK] ⚠️  Payment not found for ID: ${paymentId}`);
                }
            } else {
                console.warn(`[WEBHOOK] ⚠️  No paymentId in payment intent metadata`);
            }

            break;
        }
        default:
            console.log(`[WEBHOOK] ⚠️  Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
    handlerStripeWebhookEvent,
    createCheckoutSession,
};
