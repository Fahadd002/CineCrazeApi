import { Router } from "express";  
import { AuthRoutes } from "../../modules/auth/auth.route";
import { UserRoutes } from "../../modules/users/user.route";
import { AdminRoutes } from "../../modules/admin/admin.route";
import { ContentRoutes } from "../../modules/content/content.route";
import { ContentManagerRoutes } from "../../modules/contentManager/contentManager.route";
import { WatchlistRoutes } from "../../modules/watchlist/watchlist.route";
import { ReviewRoutes } from "../../modules/review/review.route";
import { PaymentRoutes } from "../../modules/payment/payment.route";
import { SubscriptionRoutes } from "../../modules/subscription/subscription.route";
import { TicketRoutes } from "../../modules/ticket/ticket.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/admins", AdminRoutes);
router.use("/contents", ContentRoutes);
router.use("/content-managers", ContentManagerRoutes);
router.use("/watchlist", WatchlistRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/payments", PaymentRoutes);
router.use("/subscriptions", SubscriptionRoutes);
router.use("/tickets", TicketRoutes);

export const IndexRoutes = router;