import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getViewerOrThrow = async (user: IRequestUser) => {
    const viewer = await prisma.viewer.findUnique({
        where: {
            userId: user.userId,
        }
    });

    if (!viewer) {
        throw new AppError(status.FORBIDDEN, "Viewer not found");
    }

    return viewer;
};

const addToWatchlist = async (contentId: string, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const content = await prisma.content.findUnique({
        where: { id: contentId },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    const watchlistItem = await prisma.watchlist.upsert({
        where: {
            viewerId_contentId: {
                viewerId: viewer.id,
                contentId,
            }
        },
        update: {},
        create: {
            viewerId: viewer.id,
            contentId,
        },
        include: {
            content: true,
        }
    });

    return watchlistItem;
};

const getMyWatchlist = async (user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const watchlist = await prisma.watchlist.findMany({
        where: {
            viewerId: viewer.id,
        },
        include: {
            content: true,
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return watchlist;
};

const removeFromWatchlist = async (contentId: string, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const watchlistItem = await prisma.watchlist.findUnique({
        where: {
            viewerId_contentId: {
                viewerId: viewer.id,
                contentId,
            }
        }
    });

    if (!watchlistItem) {
        throw new AppError(status.NOT_FOUND, "Watchlist item not found");
    }

    await prisma.watchlist.delete({
        where: {
            viewerId_contentId: {
                viewerId: viewer.id,
                contentId,
            }
        }
    });

    return null;
};

export const WatchlistService = {
    addToWatchlist,
    getMyWatchlist,
    removeFromWatchlist,
};

