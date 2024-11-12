// src/routers/ticket/ticket.router.ts
import express from "express";
const router = express.Router();

// middleware
import { authMiddleware } from "../../middlewares";

// enum
import { ENUM_AUTH_ROLES } from "../../utils";

// controllers
import {
  GetAllTickets,
  GetTicketById,
  AddOneTicket,
  UpdateTicketById,
  DeleteTicketById,
} from "../../controllers";

//routes
router.get(
  "/all",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetAllTickets
);
router.get(
  "/find/:ticketId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetTicketById
);
router.post(
  "/add",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  AddOneTicket
);
router.patch(
  "/update/:ticketId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  UpdateTicketById
);
router.delete(
  "/delete/:ticketId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  DeleteTicketById
);

export const TicketRouter = router;
