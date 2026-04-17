import z from "zod";
import { AccessType, MediaType } from "../../../generated/prisma/enums";

export const createContentZodSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    posterUrl: z.string().url().optional(),
    trailerUrl: z.string().url().optional(),
    streamingUrl: z.string().url().optional(),
    releaseYear: z.number().int().min(1888, "Release year is not valid"),
    director: z.string().optional(),
    cast: z.array(z.string()).default([]),
    genres: z.array(z.string()).default([]),
    mediaType: z.nativeEnum(MediaType).optional(),
    accessType: z.nativeEnum(AccessType).optional(),
    ticketPrice: z.number().nonnegative().nullable().optional(),
});

export const updateContentZodSchema = createContentZodSchema.partial();

