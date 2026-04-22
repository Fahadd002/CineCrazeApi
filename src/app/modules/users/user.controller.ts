import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { managerService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createManager = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const manager = await managerService.createManager(payload);
        sendResponse(res, {
           httpStatusCode: status.CREATED,
           success: true,
           message: 'Manager created successfully',
           data: manager
         });
    }
);

export const managerController = {
    createManager: createManager
}