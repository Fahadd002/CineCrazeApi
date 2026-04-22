import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { TicketController } from "./ticket.controller";

const router = Router();

router.get("/my-tickets", checkAuth(Role.VIEWER), TicketController.getMyTickets);
router.post("/", checkAuth(Role.VIEWER), TicketController.purchaseTicket);

export const TicketRoutes = router;
