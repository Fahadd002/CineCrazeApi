import z from "zod";

export const createCheckoutSessionZodSchema = z.object({
    contentId: z.string().uuid({ message: "Valid contentId is required" }),
});
