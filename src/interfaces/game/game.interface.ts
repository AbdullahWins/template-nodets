// src/interfaces/game/game.interface.ts
import { Model } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// Define an interface for prize objects
export interface IPrize {
  match: number;
  amount: number;
}

// game interface
export interface IGame extends ICommonSchema {
  _id: string;
  name: string;
  totalNumbers: number;
  price: number;
  prize: IPrize[];
}

// game schema methods
export interface IGameModel extends Model<IGame> {
  isGameExistsById(gameId: string, select?: string): Promise<IGame | null>;
}

export interface IGameDocument extends IGame, Document {}
