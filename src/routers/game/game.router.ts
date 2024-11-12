// src/routers/game/game.router.ts
import express from "express";
const router = express.Router();

// middleware
import { authMiddleware } from "../../middlewares";

// enum
import { ENUM_AUTH_ROLES } from "../../utils";

// controllers
import {
  GetAllGames,
  GetGameById,
  AddOneGame,
  UpdateGameById,
  DeleteGameById,
} from "../../controllers";

//routes
router.get(
  "/all",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  GetAllGames
);
router.get(
  "/find/:gameId",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  GetGameById
);
router.post(
  "/add",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  AddOneGame
);
router.patch(
  "/update/:gameId",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  UpdateGameById
);
router.delete(
  "/delete/:gameId",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  DeleteGameById
);

export const GameRouter = router;
