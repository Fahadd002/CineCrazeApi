import z from "zod";

export const createReviewZodSchema = z.object({
    contentId: z.string().min(1, "Content id is required"),
    rating: z.number().int().min(1).max(5),
    tags: z.array(z.string()).default([]),
    hasSpoiler: z.boolean().optional(),
    parentId: z.string().optional(),
});

export const updateReviewZodSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
    hasSpoiler: z.boolean().optional(),
});

