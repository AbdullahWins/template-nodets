// src/interfaces/user/user.interface.ts
import { Model } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// user interface
export interface IUser extends ICommonSchema {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  profileImage: string;
  isEmailVerified: boolean;
}

// user schema methods
export interface IUserModel extends Model<IUser> {
  isUserExistsById(userId: string, select?: string): Promise<IUser | null>;
  isUserExistsByEmail(email: string, select?: string): Promise<IUser | null>;
}

export interface IUserDocument extends IUser, Document {}
