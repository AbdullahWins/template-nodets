// src/dtos/ticket/ticket.dto.ts
import { Types } from "mongoose";
import { ITicket } from "../../interfaces";

// Base Ticket DTO
export class TicketDto implements Partial<ITicket> {
  _id: string;
  shopId: Types.ObjectId;
  productId: Types.ObjectId;
  gameId: Types.ObjectId;
  ticketNumber: string;
  gameType: "straight" | "chance" | "random";
  price: number;
  sellingDate: Date;

  constructor(ticket: ITicket) {
    this._id = ticket._id;
    this.shopId = ticket.shopId;
    this.productId = ticket.productId;
    this.gameId = ticket.gameId;
    this.ticketNumber = ticket.ticketNumber.toString();
    this.gameType = ticket.gameType;
    this.price = ticket.price;
    this.sellingDate = ticket.sellingDate;
  }
}

// DTO for ticket response after signup/signin
export class TicketResponseDto extends TicketDto {
  constructor(ticket: ITicket) {
    super(ticket);
  }
}
