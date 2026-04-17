import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { WatchlistController } from "./watchlist.controller";
import { addToWatchlistZodSchema } from "./watchlist.validation";

const router = Router();

router.get("/", checkAuth(Role.VIEWER), WatchlistController.getMyWatchlist);
router.post("/", checkAuth(Role.VIEWER), validateRequest(addToWatchlistZodSchema), WatchlistController.addToWatchlist);
router.delete("/:contentId", checkAuth(Role.VIEWER), WatchlistController.removeFromWatchlist);

export const WatchlistRoutes = router;

