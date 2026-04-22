import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { SubscriptionController } from "./subscription.controller";

const router = Router();

router.get("/my-subscriptions", checkAuth(Role.VIEWER), SubscriptionController.getMySubscriptions);
router.post("/", checkAuth(Role.VIEWER), SubscriptionController.createSubscription);
router.patch("/:subscriptionId/cancel", checkAuth(Role.VIEWER), SubscriptionController.cancelSubscription);

export const SubscriptionRoutes = router;
