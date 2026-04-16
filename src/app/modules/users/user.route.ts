import { Router } from "express";
import { managerController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createManagerZodSchema } from "./user.validation";

const router = Router();

router.post('/create-manager', validateRequest(createManagerZodSchema), managerController.createManager);

export const UserRoutes = router;