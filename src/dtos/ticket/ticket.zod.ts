// src/dtos/ticket/ticket.zod.ts
import { z } from "zod";

const TicketDtoZodSchema = z.object({
  shopId: z.string().min(1),
  productId: z.string().min(1),
  gameId: z.string().min(1),
  ticketNumber: z.string().min(1),
  gameType: z.string().min(1),
  price: z.number().min(0),
  sellingDate: z.date(),
});

// Extended Store DTO schema for full store details
export const TicketAddDtoZodSchema = TicketDtoZodSchema.pick({
  shopId: true,
  productId: true,
  gameId: true,
  ticketNumber: true,
  gameType: true,
  price: true,
  sellingDate: true,
});
