import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { ContentController } from "./content.controller";

const router = Router();

router.get("/", ContentController.getAllContents);
router.get(
    "/my-contents",
    checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
    ContentController.getMyContents
);
router.get(
    "/:id/watch",
    checkAuth(Role.VIEWER, Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
    ContentController.getWatchableContent
);
router.get("/:id", ContentController.getContentById);

router.post(
    "/",
    checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "posterImage", maxCount: 1 },
    ]),
    ContentController.createContent
);

router.patch(
    "/:id",
    checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "posterImage", maxCount: 1 },
    ]),
    ContentController.updateContent
);

router.delete(
    "/:id",
    checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
    ContentController.deleteContent
);

export const ContentRoutes = router;
