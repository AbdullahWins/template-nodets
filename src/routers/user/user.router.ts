// src/routers/user/user.router.ts
import express from "express";
const router = express.Router();

// middleware
import { authMiddleware } from "../../middlewares";

// enum
import { ENUM_AUTH_ROLES } from "../../utils";

// controllers
import {
  SignInUser,
  SignUpUser,
  GetAllUsers,
  GetUserById,
  UpdateUserById,
  DeleteUserById,
} from "../../controllers";

//routes
router.post("/signin", SignInUser);
router.post("/signup", SignUpUser);
router.get(
  "/all",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetAllUsers
);
router.get(
  "/find/:userId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetUserById
);
router.patch(
  "/update/:userId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  UpdateUserById
);
router.delete(
  "/delete/:userId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  DeleteUserById
);

export const UserRouter = router;
