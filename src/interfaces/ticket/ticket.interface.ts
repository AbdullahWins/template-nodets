// src/interfaces/ticket/ticket.interface.ts
import { Model, Types } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// ticket interface
export interface ITicket extends ICommonSchema {
  _id: string;
  shopId: Types.ObjectId;
  productId: Types.ObjectId;
  gameId: Types.ObjectId;
  ticketNumber: String;
  gameType: "straight" | "chance" | "random";
  price: number;
  sellingDate: Date;
}

// ticket schema methods
export interface ITicketModel extends Model<ITicket> {
  isTicketExistsById(
    ticketId: string,
    select?: string
  ): Promise<ITicket | null>;
}

export interface ITicketDocument extends ITicket, Document {}
