import status from "http-status";
import { ReviewStatus } from "../../../generated/prisma/enums";
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

const createReview = async (
    payload: { contentId: string; rating: number; tags: string[]; hasSpoiler?: boolean; parentId?: string },
    user: IRequestUser
) => {
    const viewer = await getViewerOrThrow(user);

    const content = await prisma.content.findUnique({
        where: { id: payload.contentId },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (payload.parentId) {
        const parentReview = await prisma.review.findUnique({
            where: { id: payload.parentId },
        });

        if (!parentReview) {
            throw new AppError(status.NOT_FOUND, "Parent review not found");
        }
    }

    const review = await prisma.review.create({
        data: {
            viewerId: viewer.id,
            contentId: payload.contentId,
            rating: payload.rating,
            tags: payload.tags,
            hasSpoiler: payload.hasSpoiler ?? false,
            parentId: payload.parentId,
            status: ReviewStatus.APPROVED,
        },
        include: {
            viewer: true,
            replies: true,
            likes: true,
        }
    });

    return review;
};

const getReviewsByContent = async (contentId: string) => {
    const content = await prisma.content.findUnique({
        where: { id: contentId },
    });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    const reviews = await prisma.review.findMany({
        where: {
            contentId,
            parentId: null,
            status: ReviewStatus.APPROVED,
        },
        include: {
            viewer: true,
            likes: true,
            replies: {
                include: {
                    viewer: true,
                    likes: true,
                },
                orderBy: {
                    createdAt: "asc",
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    const averageRatingAggregate = await prisma.review.aggregate({
        where: {
            contentId,
            parentId: null,
            status: ReviewStatus.APPROVED,
        },
        _avg: {
            rating: true,
        },
        _count: {
            id: true,
        }
    });

    return {
        averageRating: averageRatingAggregate._avg.rating ?? 0,
        totalReviews: averageRatingAggregate._count.id,
        reviews,
    };
};

const updateReview = async (
    reviewId: string,
    payload: { rating?: number; tags?: string[]; hasSpoiler?: boolean },
    user: IRequestUser
) => {
    const viewer = await getViewerOrThrow(user);

    const existing = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (existing.viewerId !== viewer.id) {
        throw new AppError(status.FORBIDDEN, "You can only update your own review");
    }

    const review = await prisma.review.update({
        where: { id: reviewId },
        data: payload,
    });

    return review;
};

const deleteReview = async (reviewId: string, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const existing = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!existing) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (existing.viewerId !== viewer.id) {
        throw new AppError(status.FORBIDDEN, "You can only delete your own review");
    }

    await prisma.review.delete({
        where: { id: reviewId },
    });

    return null;
};



const getMyReviews = async (user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const reviews = await prisma.review.findMany({
        where: {
            viewerId: viewer.id,
            parentId: null, // Only top-level reviews
        },
        include: {
            viewer: true,
            content: true,
            likes: true,
            replies: {
                include: {
                    viewer: true,
                    likes: true,
                },
                orderBy: {
                    createdAt: "asc",
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return reviews;
};

const toggleLike = async (reviewId: string, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    const existingLike = await prisma.like.findUnique({
        where: {
            viewerId_reviewId: {
                viewerId: viewer.id,
                reviewId,
            }
        }
    });

    if (existingLike) {
        await prisma.$transaction(async (tx) => {
            await tx.like.delete({
                where: {
                    viewerId_reviewId: {
                        viewerId: viewer.id,
                        reviewId,
                    }
                }
            });

            await tx.review.update({
                where: { id: reviewId },
                data: {
                    likesCount: {
                        decrement: 1,
                    }
                }
            });
        });

        return { liked: false };
    }

    await prisma.$transaction(async (tx) => {
        await tx.like.create({
            data: {
                viewerId: viewer.id,
                reviewId,
            }
        });

        await tx.review.update({
            where: { id: reviewId },
            data: {
                likesCount: {
                    increment: 1,
                }
            }
        });
    });

    return { liked: true };
};

export const ReviewService = {
    createReview,
    getReviewsByContent,
    getMyReviews,
    updateReview,
    deleteReview,
    toggleLike,
};





