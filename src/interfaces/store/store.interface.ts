// src/interfaces/store/store.interface.ts
import { Model } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// store interface
export interface IStore extends ICommonSchema {
  _id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  image?: string;
  document?: string;
  role?: string;
  otp?: string | undefined;
  otpExpires?: number | undefined;
}

// store schema methods
export interface IStoreModel extends Model<IStore> {
  isStoreExistsById(storeId: string, select?: string): Promise<IStore | null>;
  isStoreExistsByEmail(email: string, select?: string): Promise<IStore | null>;
}

export interface IStoreDocument extends IStore, Document {}
