import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { createCheckoutSessionZodSchema } from "./payment.validation";

const router = Router();

router.post(
    "/checkout",
    checkAuth(Role.VIEWER),
    validateRequest(createCheckoutSessionZodSchema),
    PaymentController.createCheckoutSession
);

export const PaymentRoutes = router;
