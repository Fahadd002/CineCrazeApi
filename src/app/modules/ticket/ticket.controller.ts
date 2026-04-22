import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TicketService } from "./ticket.service";
const getMyTickets = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    const result = await TicketService.getMyTickets(user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Tickets fetched successfully",
        data: result,
    });
});

const purchaseTicket = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;
    const { contentId } = req.body;

    const result = await TicketService.purchaseTicket({ contentId }, user);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Ticket purchased successfully",
        data: result,
    });
});

export const TicketController = {
    getMyTickets,
    purchaseTicket,
};
