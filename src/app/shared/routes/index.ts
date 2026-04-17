import { Router } from "express";  
import { AuthRoutes } from "../../modules/auth/auth.route";
import { UserRoutes } from "../../modules/users/user.route";
import { AdminRoutes } from "../../modules/admin/admin.route";
import { ContentRoutes } from "../../modules/content/content.route";
import { WatchlistRoutes } from "../../modules/watchlist/watchlist.route";
import { ReviewRoutes } from "../../modules/review/review.route";
import { PaymentRoutes } from "../../modules/payment/payment.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/admins", AdminRoutes);
router.use("/contents", ContentRoutes);
router.use("/watchlist", WatchlistRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/payments", PaymentRoutes);

export const IndexRoutes = router;