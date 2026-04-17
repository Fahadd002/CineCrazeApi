import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

router.get("/content/:contentId", ReviewController.getReviewsByContent);
router.post("/", checkAuth(Role.VIEWER), validateRequest(createReviewZodSchema), ReviewController.createReview);
router.patch("/:reviewId", checkAuth(Role.VIEWER), validateRequest(updateReviewZodSchema), ReviewController.updateReview);
router.delete("/:reviewId", checkAuth(Role.VIEWER), ReviewController.deleteReview);
router.post("/:reviewId/toggle-like", checkAuth(Role.VIEWER), ReviewController.toggleLike);

export const ReviewRoutes = router;

