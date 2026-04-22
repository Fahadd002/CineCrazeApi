import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateContentManagerZodSchema = z.object({
    contentManager: z.object({
        name: z.string().min(1).optional(),
        contactNumber: z.string().min(7).optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
    }).optional(),
});
