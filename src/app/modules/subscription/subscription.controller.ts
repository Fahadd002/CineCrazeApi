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

const getSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
    const plans = [
        {
            id: "PREMIUM_MONTHLY",
            name: "Premium Monthly",
            price: 9.99,
            billingCycle: "monthly",
            description: "Unlimited streaming and premium features",
            features: [
                "Unlimited access to all movies and TV shows",
                "Ad-free experience",
                "4K streaming quality",
                "Offline downloads",
                "Multiple device support",
            ],
        },
        {
            id: "PREMIUM_YEARLY",
            name: "Premium Yearly",
            price: 99.99,
            billingCycle: "yearly",
            description: "Best value - save 17% compared to monthly",
            features: [
                "All monthly features included",
                "Support for up to 4 devices simultaneously",
                "Exclusive early access to new releases",
                "Priority customer support",
                "Family sharing options",
            ],
        },
    ];

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plans fetched successfully",
        data: plans,
    });
});

export const SubscriptionController = {
    getMySubscriptions,
    createSubscription,
    cancelSubscription,
    getSubscriptionPlans,
};
