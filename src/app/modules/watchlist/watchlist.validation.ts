import z from "zod";

export const addToWatchlistZodSchema = z.object({
    contentId: z.string().min(1, "Content id is required"),
});

