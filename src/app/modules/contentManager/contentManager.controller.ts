/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { ContentManagerService } from "./contentManager.service";

const getAllContentManagers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await ContentManagerService.getAllContentManagers(query as any);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Content managers fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getContentManagerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const manager = await ContentManagerService.getContentManagerById(id as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Content manager fetched successfully',
        data: manager,
    });
});

const updateContentManager = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updated = await ContentManagerService.updateContentManager(id as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Content manager updated successfully',
        data: updated,
    });
});

const deleteContentManager = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // user info from auth middleware
    const user = (req as any).user;
    const result = await ContentManagerService.deleteContentManager(id as string, user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Content manager deleted successfully',
        data: result,
    });
});

export const ContentManagerController = {
    getAllContentManagers,
    getContentManagerById,
    updateContentManager,
    deleteContentManager,
};
