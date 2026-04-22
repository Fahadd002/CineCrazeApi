import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import type { PaymentStatus as PaymentStatusType } from "../../../generated/prisma/enums";

const getViewerOrThrow = async (user: IRequestUser) => {
    const viewer = await prisma.viewer.findUnique({
        where: { userId: user.userId },
    });

    if (!viewer) {
        throw new AppError(status.FORBIDDEN, "Viewer not found");
    }

    return viewer;
};

const getMyTickets = async (user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const tickets = await prisma.ticket.findMany({
        where: { viewerId: viewer.id },
        include: { content: true, payment: true },
        orderBy: { purchasedAt: "desc" },
    });

    return tickets;
};

const purchaseTicket = async (payload: { contentId: string }, user: IRequestUser) => {
    const viewer = await getViewerOrThrow(user);

    const content = await prisma.content.findUnique({ where: { id: payload.contentId } });

    if (!content) {
        throw new AppError(status.NOT_FOUND, "Content not found");
    }

    const existing = await prisma.ticket.findUnique({
        where: { viewerId_contentId: { viewerId: viewer.id, contentId: payload.contentId } },
    });

    if (existing) {
        throw new AppError(status.CONFLICT, "Ticket already purchased for this content");
    }

    const ticket = await prisma.ticket.create({
        data: {
            viewerId: viewer.id,
            contentId: payload.contentId,
            paymentStatus: "UNPAID" as PaymentStatusType,
        },
        include: { content: true },
    });

    return ticket;
};

export const TicketService = {
    getMyTickets,
    purchaseTicket,
};
