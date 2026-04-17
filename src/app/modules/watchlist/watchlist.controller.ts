import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { WatchlistService } from "./watchlist.service";

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const { contentId } = req.body;

    const result = await WatchlistService.addToWatchlist(contentId, user);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Content added to watchlist successfully",
        data: result,
    });
});

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await WatchlistService.getMyWatchlist(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Watchlist fetched successfully",
        data: result,
    });
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const contentId = req.params.contentId as string;

    await WatchlistService.removeFromWatchlist(contentId, user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Content removed from watchlist successfully",
        data: null,
    });
});

export const WatchlistController = {
    addToWatchlist,
    getMyWatchlist,
    removeFromWatchlist,
};

