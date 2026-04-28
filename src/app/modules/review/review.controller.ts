import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const payload = req.body;

    const result = await ReviewService.createReview(payload, user);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

const getReviewsByContent = catchAsync(async (req: Request, res: Response) => {
    const contentId = req.params.contentId as string;

    const result = await ReviewService.getReviewsByContent(contentId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Reviews fetched successfully",
        data: result,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const reviewId = req.params.reviewId as string;
    const payload = req.body;

    const result = await ReviewService.updateReview(reviewId, payload, user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const reviewId = req.params.reviewId as string;

    await ReviewService.deleteReview(reviewId, user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review deleted successfully",
        data: null,
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await ReviewService.getMyReviews(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Reviews fetched successfully",
        data: result,
    });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const reviewId = req.params.reviewId as string;

    const result = await ReviewService.toggleLike(reviewId, user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Like toggled successfully",
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getReviewsByContent,
    getMyReviews,
    updateReview,
    deleteReview,
    toggleLike,
};

