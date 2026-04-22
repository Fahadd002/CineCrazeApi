import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ContentManagerController } from "./contentManager.controller";
import { updateContentManagerZodSchema } from "./contentManager.validation";

const router = Router();

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ContentManagerController.getAllContentManagers
);

router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ContentManagerController.getContentManagerById
);

router.patch(
    "/:id",
    checkAuth(Role.SUPER_ADMIN),
    validateRequest(updateContentManagerZodSchema),
    ContentManagerController.updateContentManager
);

router.delete(
    "/:id",
    checkAuth(Role.SUPER_ADMIN),
    ContentManagerController.deleteContentManager
);

export const ContentManagerRoutes = router;
