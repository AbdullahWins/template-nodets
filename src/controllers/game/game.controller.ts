// src/controllers/game/game.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { Game } from "../../models";
import { ApiError, catchAsync, staticProps, sendResponse } from "../../utils";
import { GameAddDtoZodSchema, GameResponseDto } from "../../dtos";
import { isValidObjectId } from "mongoose";
import { IPrize } from "../../interfaces";
import { validateZodSchema } from "../../services";

// get all games
export const GetAllGames: RequestHandler = catchAsync(async (_req, res) => {
  const games = await Game.find();

  if (!games) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const gamesFromDto = games.map((game) => new GameResponseDto(game));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: gamesFromDto,
  });
});

// get one game
export const GetGameById: RequestHandler = catchAsync(async (req, res) => {
  const { gameId } = req.params;

  // Validate ID format
  if (!isValidObjectId(gameId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const game = await Game.findOne({ _id: gameId });

  if (!game) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const gameFromDto = new GameResponseDto(game);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: gameFromDto,
  });
});

// create one game
export const AddOneGame: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Parsing data
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};

    // validate data with zod schema
    validateZodSchema(GameAddDtoZodSchema, parsedData);

    const { name, totalNumbers, price, prize } = parsedData;

    // Validate required fields
    if (!name || !totalNumbers || !price || !prize)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    // Ensure prize array has the correct structure
    const formattedPrize: IPrize[] = prize.map((prize: IPrize) => ({
      match: prize.match || 0,
      amount: prize.amount || 0,
    }));

    const constructedData = {
      name,
      totalNumbers,
      price,
      prize: formattedPrize,
    };

    // Create new game
    const gameData = await Game.create(constructedData);

    if (!gameData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    const gameFromDto = new GameResponseDto(gameData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: staticProps.common.CREATED,
      data: gameFromDto,
    });
  }
);

// update one game
export const UpdateGameById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const gameId = req.params.gameId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};

    //get parsed data
    const { name, totalNumbers, price, prize } = parsedData;

    if (!gameId) {
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
    }

    if (!name && !totalNumbers && !price && !prize) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // Check if a game exists or not
    const existsGame = await Game.isGameExistsById(gameId, "_id");
    if (!existsGame)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    //construct data
    let constructedData = {
      name,
      totalNumbers,
      price,
      prize,
    };

    // updating role info
    const gameData = await Game.findOneAndUpdate(
      { _id: gameId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    //process the game data
    if (!gameData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }
    const gameFromDto = new GameResponseDto(gameData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data: gameFromDto,
    });
  }
);

// delete one game
export const DeleteGameById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const gameId = req.params.gameId;

    if (!gameId)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);

    const result = await Game.deleteOne({ _id: gameId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
