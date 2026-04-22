import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import type { SubscriptionPlan as SubscriptionPlanType, PaymentStatus as PaymentStatusType } from "../../../generated/prisma/enums";

const getViewerOrThrow = async (user: IRequestUser) => {
    const viewer = await prisma.viewer.findUnique({
        where: { userId: user.userId },
    });

    if (!viewer) {
        throw new AppError(status.FORBIDDEN, "Viewer not found");
    }

    return viewer;
};

const getMySubscriptions = async (user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const subscriptions = await prisma.subscription.findMany({
        where: { viewerId: viewer.id },
        include: { payments: true },
        orderBy: { createdAt: "desc" },
    });

    return subscriptions;
};

const createSubscription = async (payload: { plan: SubscriptionPlanType; amount?: number; endDate?: string }, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const end = payload.endDate ? new Date(payload.endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    const subscription = await prisma.subscription.create({
        data: {
            plan: payload.plan,
            amount: payload.amount ?? 0,
            endDate: end,
            viewerId: viewer.id,
        }
    });

    return subscription;
};

const cancelSubscription = async (subscriptionId: string, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });

    if (!subscription || subscription.viewerId !== viewer.id) {
        throw new AppError(status.NOT_FOUND, "Subscription not found");
    }

    await prisma.subscription.update({ where: { id: subscriptionId }, data: { status: "FAILED" as PaymentStatusType } });

    return null;
};

export const SubscriptionService = {
    getMySubscriptions,
    createSubscription,
    cancelSubscription,
};
