import { PaymentStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";

const cancelUnpaidSubscriptions = async () => {
  const now = new Date();

  const result = await prisma.subscription.updateMany({
    where: {
      status: {
        in: [PaymentStatus.UNPAID, PaymentStatus.PENDING],
      },
      endDate: {
        lte: now,
      },
    },
    data: {
      status: PaymentStatus.FAILED,
    },
  });

  return result.count;
};

const cancelUnpaidTickets = async () => {
  const expirationThreshold = new Date(Date.now() - 1000 * 60 * 60); // 1 hour

  const result = await prisma.ticket.deleteMany({
    where: {
      paymentStatus: {
        in: [PaymentStatus.UNPAID, PaymentStatus.PENDING],
      },
      purchasedAt: {
        lte: expirationThreshold,
      },
    },
  });

  return result.count;
};

export const SubscriptionService = {
  cancelUnpaidSubscriptions,
};

export const TicketService = {
  cancelUnpaidTickets,
};
