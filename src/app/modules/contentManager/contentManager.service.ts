/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getAllContentManagers = async (query: any) => {
    const queryBuilder = new QueryBuilder(prisma.contentManager, query, {
        searchableFields: ["name", "email", "user.email", "user.name"],
    });

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .dynamicInclude({
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    emailVerified: true,
                    image: true,
                    status: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
        }, ["user"])
        .sort()
        .execute();

    return result;
}

const getContentManagerById = async (id: string) => {
    const manager = await prisma.contentManager.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    emailVerified: true,
                    image: true,
                    status: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
        }
    });

    if (!manager) {
        throw new AppError(status.NOT_FOUND, "Content manager not found");
    }

    return manager;
}

const updateContentManager = async (id: string, payload: any) => {
    const existing = await prisma.contentManager.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Content manager not found");
    }

    const { contentManager } = payload;

    const updated = await prisma.contentManager.update({
        where: { id },
        data: {
            ...contentManager,
        }
    });

    return updated;
}

const deleteContentManager = async (id: string, user: IRequestUser) => {
    const existing = await prisma.contentManager.findUnique({ where: { id } });
    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Content manager not found");
    }

    if (existing.id === user.userId) {
        throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.contentManager.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            }
        });

        await tx.user.update({
            where: { id: existing.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            }
        });

        await tx.session.deleteMany({ where: { userId: existing.userId } });
        await tx.account.deleteMany({ where: { userId: existing.userId } });

        const manager = await getContentManagerById(id);
        return manager;
    });

    return result;
}

export const ContentManagerService = {
    getAllContentManagers,
    getContentManagerById,
    updateContentManager,
    deleteContentManager,
};
