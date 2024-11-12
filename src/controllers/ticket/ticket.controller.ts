// src/controllers/ticket/ticket.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { Ticket } from "../../models";
import { ApiError, catchAsync, staticProps, sendResponse } from "../../utils";
import { TicketAddDtoZodSchema, TicketResponseDto } from "../../dtos";
import { isValidObjectId } from "mongoose";
import { validateZodSchema } from "../../services";

// get all tickets
export const GetAllTickets: RequestHandler = catchAsync(async (_req, res) => {
  const tickets = await Ticket.find();

  if (!tickets || tickets.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const ticketsFromDto = tickets.map((ticket) => new TicketResponseDto(ticket));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: ticketsFromDto,
  });
});

// get one ticket
export const GetTicketById: RequestHandler = catchAsync(async (req, res) => {
  const { ticketId } = req.params;

  // Validate ID format
  if (!isValidObjectId(ticketId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const ticket = await Ticket.findOne({ _id: ticketId });

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const ticketFromDto = new TicketResponseDto(ticket);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: ticketFromDto,
  });
});

// create one ticket
export const AddOneTicket: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Parsing data
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};

    const { name, totalNumbers, price, prize } = parsedData;

    // Validate required fields
    if (!name || !totalNumbers || !price || !prize)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    // validate data with zod schema
    validateZodSchema(TicketAddDtoZodSchema, parsedData);

    const constructedData = {
      name,
      totalNumbers,
      price,
    };

    // Create new ticket
    const ticketData = await Ticket.create(constructedData);

    if (!ticketData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    const ticketFromDto = new TicketResponseDto(ticketData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: staticProps.common.CREATED,
      data: ticketFromDto,
    });
  }
);

// update one ticket
export const UpdateTicketById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const ticketId = req.params.ticketId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};

    //get parsed data
    const { name, totalNumbers, price, prize } = parsedData;

    if (!ticketId) {
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
    }

    if (!name && !totalNumbers && !price && !prize) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // Check if a ticket exists or not
    const existsTicket = await Ticket.isTicketExistsById(ticketId, "_id");
    if (!existsTicket)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    //construct data
    let constructedData = {
      name,
      totalNumbers,
      price,
      prize,
    };

    // updating role info
    const ticketData = await Ticket.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    //process the ticket data
    if (!ticketData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }
    const ticketFromDto = new TicketResponseDto(ticketData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data: ticketFromDto,
    });
  }
);

// delete one ticket
export const DeleteTicketById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const ticketId = req.params.ticketId;

    if (!ticketId)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);

    const result = await Ticket.deleteOne({ _id: ticketId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
