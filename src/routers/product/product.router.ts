// src/routers/product/product.router.ts
import express from "express";
const router = express.Router();

// middleware
import { authMiddleware } from "../../middlewares";

// enum
import { ENUM_AUTH_ROLES } from "../../utils";

// controllers
import {
  GetAllProducts,
  GetProductById,
  AddOneProduct,
  UpdateProductById,
  DeleteProductById,
} from "../../controllers";

//routes
router.get(
  "/all",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetAllProducts
);
router.get(
  "/find/:productId",
  authMiddleware([
    ENUM_AUTH_ROLES.SUPER_ADMIN,
    ENUM_AUTH_ROLES.NORMAL_ADMIN,
    ENUM_AUTH_ROLES.STORE_ADMIN,
  ]),
  GetProductById
);
router.post(
  "/add",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  AddOneProduct
);
router.patch(
  "/update/:productId",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  UpdateProductById
);
router.delete(
  "/delete/:productId",
  authMiddleware([ENUM_AUTH_ROLES.SUPER_ADMIN, ENUM_AUTH_ROLES.NORMAL_ADMIN]),
  DeleteProductById
);

export const ProductRouter = router;
