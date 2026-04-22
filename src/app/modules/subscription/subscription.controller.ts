import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";

const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await SubscriptionService.getMySubscriptions(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscriptions fetched successfully",
        data: result,
    });
});

const createSubscription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const { plan, amount, endDate } = req.body;

    const result = await SubscriptionService.createSubscription({ plan, amount, endDate }, user);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Subscription created successfully",
        data: result,
    });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const subscriptionId = req.params.subscriptionId as string;

    await SubscriptionService.cancelSubscription(subscriptionId, user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription cancelled successfully",
        data: null,
    });
});

export const SubscriptionController = {
    getMySubscriptions,
    createSubscription,
    cancelSubscription,
};
