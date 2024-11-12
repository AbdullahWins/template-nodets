// src/routers/main/routes.ts
import express, { Router } from "express";
import { AdminRouter, GameRouter, StoreRouter, UserRouter } from "..";
import { ProductRouter } from "../product/product.router";
import { TicketRouter } from "../ticket/ticket.router";

export const apiRouter = express.Router();

const apiRoutes: { path: string; route: Router }[] = [
  {
    path: "/users",
    route: UserRouter,
  },
  {
    path: "/admins",
    route: AdminRouter,
  },
  {
    path: "/stores",
    route: StoreRouter,
  },
  {
    path: "/games",
    route: GameRouter,
  },
  {
    path: "/products",
    route: ProductRouter,
  },
  {
    path: "/tickets",
    route: TicketRouter,
  },
];

apiRoutes.forEach((route) => apiRouter.use(route.path, route.route));
