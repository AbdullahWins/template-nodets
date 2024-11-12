// src/routers/store/store.router.ts
import express from "express";
const router = express.Router();

// middleware
import { authMiddleware } from "../../middlewares";

// enum
import { ENUM_AUTH_ROLES } from "../../utils";

// controllers
import {
  SignInStore,
  VerifyOtp,
  AddOneStore,
  GetAllStores,
  GetStoreById,
  UpdateStoreById,
  DeleteStoreById,
} from "../../controllers";

//routes
router.post("/signin", SignInStore);
router.post("/verify", VerifyOtp);
router.post(
  "/signup",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN]),
  AddOneStore
);
router.get(
  "/all",
  authMiddleware([ENUM_AUTH_ROLES.STORE_ADMIN, ENUM_AUTH_ROLES.SUPER_ADMIN]),
  GetAllStores
);
router.get(
  "/find/:storeId",
  authMiddleware([ENUM_AUTH_ROLES.STORE_ADMIN, ENUM_AUTH_ROLES.SUPER_ADMIN]),
  GetStoreById
);
router.patch(
  "/update/:storeId",
  authMiddleware([ENUM_AUTH_ROLES.STORE_ADMIN, ENUM_AUTH_ROLES.SUPER_ADMIN]),
  UpdateStoreById
);
router.delete(
  "/delete/:storeId",
  authMiddleware([ENUM_AUTH_ROLES.STORE_ADMIN, ENUM_AUTH_ROLES.SUPER_ADMIN]),
  DeleteStoreById
);

export const StoreRouter = router;
