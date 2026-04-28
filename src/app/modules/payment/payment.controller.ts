 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const handleStripeWebhookEvent = catchAsync(async (req : Request, res : Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    console.log('═══════════════════════════════════════════════════════');
    console.log('[WEBHOOK] 🔔 WEBHOOK REQUEST RECEIVED');
    console.log('[WEBHOOK] Signature present:', !!signature);
    console.log('[WEBHOOK] Webhook secret configured:', !!webhookSecret);
    console.log('[WEBHOOK] Raw body type:', typeof req.body);
    console.log('[WEBHOOK] Raw body length:', req.body?.length || Buffer.byteLength(req.body) || 0);
    console.log('═══════════════════════════════════════════════════════');

    if(!signature || !webhookSecret){
        console.error("[WEBHOOK] ❌ Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({message : "Missing Stripe signature or webhook secret"})
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        console.log('[WEBHOOK] ✅ Event constructed successfully');
        console.log('[WEBHOOK] Event type:', event.type);
        console.log('[WEBHOOK] Event ID:', event.id);
    } catch (error : any) {
        console.error("[WEBHOOK] ❌ Error verifying signature:", error.message);
        console.error("[WEBHOOK] Error code:", error.code);
        console.error("[WEBHOOK] Error type:", error.type);
        return res.status(status.BAD_REQUEST).json({message : "Error processing Stripe webhook"})
    }

    try {
        console.log('[WEBHOOK] 🔄 Passing to PaymentService.handlerStripeWebhookEvent...');
        const result = await PaymentService.handlerStripeWebhookEvent(event);
        console.log('[WEBHOOK] ✅ Service handler completed successfully');
        console.log('[WEBHOOK] Result:', result);

        sendResponse(res, {
            httpStatusCode : status.OK,
            success : true,
            message : "Stripe webhook event processed successfully",
            data : result
        })
    } catch (error: any) {
        console.error("[WEBHOOK] ❌ Error in service handler");
        console.error("[WEBHOOK] Error message:", error.message);
        console.error("[WEBHOOK] Error stack:", error.stack);
        sendResponse(res, {
            httpStatusCode : status.INTERNAL_SERVER_ERROR,
            success : false,
            message : "Error handling Stripe webhook event"
        })
    }
})

const createCheckoutSession = catchAsync(async (req : Request, res : Response) => {
    const { type, contentId, plan } = req.body;
    const user = req.user as IRequestUser;

    const session = await PaymentService.createCheckoutSession(user.userId, { type, contentId, plan });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stripe checkout session created successfully",
        data: session,
    });
});

export const PaymentController = {
    handleStripeWebhookEvent,
    createCheckoutSession,
}