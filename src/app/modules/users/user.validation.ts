import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createManagerZodSchema = z.object({
    password: z.string("Password is required").min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    manager: z.object({
        name: z.string("Name is required and must be string").min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
        email: z.email("Invalid email address"),
        contactNumber: z.string("Contact number is required").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters"),
        gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be either MALE or FEMALE"),
    }),
})