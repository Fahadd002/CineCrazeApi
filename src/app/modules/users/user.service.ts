import status from "http-status";
import { Role } from "../../../generated/prisma/client";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { ICreateManagerPayload } from "./user.interface";

const createManager = async (payload: ICreateManagerPayload) => {
    // Check if user already exists in auth system
    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.manager.email  
        }
    });
    
    if (userExists) {
        throw new AppError(status.CONFLICT, `User with email ${payload.manager.email} already exists`);
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.manager.email,
            password: payload.password,
            role: Role.CONTENT_MANAGER,
            name: payload.manager.name,
            needPasswordChange: true
        }
    });

    if (!userData.user) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user in auth system");
    }

    try {
        // Create manager
        const manager = await prisma.$transaction(async (tx) => {
            // Create manager
            const managerData = await tx.contentManager.create({
                data: {
                    userId: userData.user.id,
                    ...payload.manager,
                }
            });

            // Return manager  with all relations
            return await tx.contentManager.findUnique({
                where: {
                    id: managerData.id
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    contactNumber: true,
                    profilePhoto: true,
                    gender: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                  
                }
            });
        });

        return manager;
        
    } catch (error) {
        // If transaction fails, clean up the created user
        if (envVars.NODE_ENV === 'development') {
            console.error('Error creating manager:', error);
        }

        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        }).catch(console.error);
    }
};

export const managerService = {
    createManager
};