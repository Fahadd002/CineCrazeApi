import z from "zod";
import type { SubscriptionPlan } from "../../../generated/prisma/enums";

export const createCheckoutSessionZodSchema = z.object({
    type: z.enum(["TICKET", "SUBSCRIPTION"]),
    contentId: z.string().uuid({ message: "Valid contentId is required" }).optional(),
    plan: z.enum(["PREMIUM_MONTHLY", "PREMIUM_YEARLY"] as [SubscriptionPlan, ...SubscriptionPlan[]]).optional(),
}).refine((data) => {
    if (data.type === "TICKET" && !data.contentId) {
        return false;
    }
    if (data.type === "SUBSCRIPTION" && !data.plan) {
        return false;
    }
    return true;
}, {
    message: "Invalid payload: TICKET requires contentId, SUBSCRIPTION requires plan",
});
