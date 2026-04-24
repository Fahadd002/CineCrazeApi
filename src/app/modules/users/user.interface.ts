import { Gender } from "../../../generated/prisma/enums";

export interface ICreateManagerPayload {
    password: string;
    contentManager: {
        name: string;
        email: string;
        contactNumber: string;
        gender: Gender;
    }
}

export interface ICreateAdminPayload {
    password: string;
    admin: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
    }
    role: "ADMIN" | "SUPER_ADMIN";
}