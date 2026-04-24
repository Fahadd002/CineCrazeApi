import status from "http-status";
import { Content, Prisma } from "../../../generated/prisma/client";
import { AccessType, MediaType, PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { ICreateContentPayload, IUpdateContentPayload } from "./content.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { contentFilterableFields, contentIncludeConfig, contentSearchableFields } from "./content.constant";

const createContent = async (payload: ICreateContentPayload, user: IRequestUser) => {
    if (user.role !== Role.CONTENT_MANAGER && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
        throw new AppError(status.FORBIDDEN, "Only content managers or admins can create content");
    }

    const manager = await prisma.contentManager.findUnique({
        where: {
            userId: user.userId,
        }
    });

    const data: Prisma.ContentCreateInput = {
        ...payload,
        mediaType: payload.mediaType ?? MediaType.MOVIE,
        accessType: payload.accessType ?? AccessType.FREE,
        ticketPrice: payload.ticketPrice ?? null,
        ...(manager ? { manager: { connect: { id: manager.id } } } : {}),
    };

    const content = await prisma.content.create({
        data,
    });

    return content;
};

const getAllContents = async (query: IQueryParams) => {
    const { genre } = query;
    const queryBuilder = new QueryBuilder<Content, Prisma.ContentWhereInput, Prisma.ContentInclude>(prisma.content, query, {
        filterableFields: contentFilterableFields,
        searchableFields: contentSearchableFields
    })

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .dynamicInclude(contentIncludeConfig)
        .sort()
        .execute();

    if (genre && result.data.length > 0) {
         // Split multiple genres by comma
        const genreList = (genre as string).split(',').map(g => g.trim());

        // Filter content that includes ALL selected genres
        result.data = result.data.filter(content =>
            genreList.every(selectedGenre =>
                content.genres.includes(selectedGenre)
            )
        );

        // Update total count after filtering
        result.meta.total = result.data.length;
        result.meta.totalPages = Math.ceil(result.data.length / result.meta.limit);
    }
    return result
}

const getMyContents = async (user: IRequestUser, query: IQueryParams) => {
    if (user.role !== Role.CONTENT_MANAGER && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
        throw new AppError(status.FORBIDDEN, "Only content managers or admins can access this resource");
    }

    if (user.role === Role.CONTENT_MANAGER) {
        const manager = await prisma.contentManager.findUnique({
            where: {
                userId: user.userId,
            }
        });

        if (!manager) {
            throw new AppError(status.NOT_FOUND, "Content manager not found");
        }

        query.managerId = manager.id;
    }

    const { genre } = query;
    const queryBuilder = new QueryBuilder<Content, Prisma.ContentWhereInput, Prisma.ContentInclude>(prisma.content, query, {
        filterableFields: contentFilterableFields,
        searchableFields: contentSearchableFields
    })

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .dynamicInclude(contentIncludeConfig)
        .sort()
        .execute();

    if (genre && result.data.length > 0) {
        const genreList = (genre as string).split(',').map(g => g.trim());

        result.data = result.data.filter(content =>
            genreList.every(selectedGenre =>
                content.genres.includes(selectedGenre)
            )
        );

        result.meta.total = result.data.length;
        result.meta.totalPages = Math.ceil(result.data.length / result.meta.limit);
    }
    return result
}
   
const getContentById = async (id: string) => {
    const content = await prisma.content.findUnique({
        where: { id },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    return content;
};

const updateContent = async (id: string, payload: IUpdateContentPayload, user: IRequestUser) => {
    const existing = await prisma.content.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (user.role === Role.CONTENT_MANAGER) {
        const manager = await prisma.contentManager.findUnique({
            where: {
                userId: user.userId,
            }
        });

        if (!manager || existing.managerId !== manager.id) {
            throw new AppError(status.FORBIDDEN, "You are not allowed to modify this content");
        }
    }

    const updated = await prisma.content.update({
        where: { id },
        data: payload,
    });

    return updated;
};

const deleteContent = async (id: string, user: IRequestUser) => {
    const existing = await prisma.content.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (user.role === Role.CONTENT_MANAGER) {
        const manager = await prisma.contentManager.findUnique({
            where: {
                userId: user.userId,
            }
        });

        if (!manager || existing.managerId !== manager.id) {
            throw new AppError(status.FORBIDDEN, "You are not allowed to delete this content");
        }
    }

    await prisma.content.delete({
        where: { id },
    });

    return null;
};

const canViewerWatchContent = async (contentId: string, user: IRequestUser) => {
    const content = await prisma.content.findUnique({
        where: { id: contentId },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (content.accessType === AccessType.FREE) {
        return content;
    }

    const viewer = await prisma.viewer.findUnique({
        where: {
            userId: user.userId,
        }
    });

    if (!viewer) {
        throw new AppError(status.FORBIDDEN, "Only viewers can access content");
    }

    if (content.accessType === AccessType.SUBSCRIPTION) {
        const now = new Date();
        if (!viewer.subscriptionEnds || viewer.subscriptionEnds < now) {
            throw new AppError(status.FORBIDDEN, "Subscription required or expired");
        }

        return content;
    }

    if (content.accessType === AccessType.TICKET) {
        const ticket = await prisma.ticket.findFirst({
            where: {
                viewerId: viewer.id,
                contentId: content.id,
                paymentStatus: PaymentStatus.PAID,
            }
        });

        if (!ticket) {
            throw new AppError(status.FORBIDDEN, "Valid ticket required to watch this content");
        }

        return content;
    }

    if (content.accessType === AccessType.BOTH) {
        const hasActiveSubscription = !!viewer.subscriptionEnds && viewer.subscriptionEnds >= new Date();
        if (hasActiveSubscription) {
            return content;
        }

        const ticket = await prisma.ticket.findFirst({
            where: {
                viewerId: viewer.id,
                contentId: content.id,
                paymentStatus: PaymentStatus.PAID,
            }
        });

        if (!ticket) {
            throw new AppError(status.FORBIDDEN, "Subscription or valid ticket required to watch this content");
        }
    }

    return content;
};

export const ContentService = {
    createContent,
    getAllContents,
    getMyContents,
    getContentById,
    updateContent,
    deleteContent,
    canViewerWatchContent,
};

