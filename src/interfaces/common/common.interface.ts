// src/interfaces/common/common.interface.ts
import { Types } from "mongoose";

// common schema
export interface ICommonSchema {
  _id?: string | Types.ObjectId;
  createdAt?: number;
  updatedAt?: number;
  __v?: number;
}

export interface IErrorMessage {
  path?: string;
  message: string;
}

export interface IErrorResponse {
  statusCode: number;
  message: string;
  errorMessages?: IErrorMessage[];
  success: boolean;
  data: null;
}

export interface ISendEmail {
  email: string;
  subject: string;
  template: string;
  data: object;
}

export interface IApiReponse<T> {
  statusCode: number;
  message?: string | null;
  success?: boolean;
  data?: T | null;
}

export interface IKeyValueObject {
  [key: string]: string | undefined;
}
