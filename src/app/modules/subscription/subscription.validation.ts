import { z } from "zod";

export const subscriptionValidation = z.object({
    plan: z.enum(["PREMIUM_MONTHLY", "PREMIUM_YEARLY"]),
    amount: z.number().positive().optional(),
    endDate: z.string().optional(),
    paymentId: z.string().optional(),
});

export type SubscriptionValidationType = z.infer<typeof subscriptionValidation>;