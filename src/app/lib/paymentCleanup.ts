import { PaymentStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";

const cancelUnpaidSubscriptions = async () => {
  try {
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

    console.log(`Successfully canceled ${result.count} unpaid subscriptions`);
    return result.count;
  } catch (error) {
    console.error("Error canceling unpaid subscriptions:", error);
    // Don't throw, let the cron job continue even if this fails
    return 0;
  }
};

const cancelUnpaidTickets = async () => {
  try {
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

    console.log(`Successfully deleted ${result.count} unpaid tickets`);
    return result.count;
  } catch (error) {
    console.error("Error deleting unpaid tickets:", error);
    // Don't throw, let the cron job continue even if this fails
    return 0;
  }
};

export const SubscriptionService = {
  cancelUnpaidSubscriptions,
};

export const TicketService = {
  cancelUnpaidTickets,
};
