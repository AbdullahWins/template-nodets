// src/interfaces/admin/admin.interface.ts
import { Model } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// admin interface
export interface IAdmin extends ICommonSchema {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  profileImage: string;
  role: string;
  isEmailVerified: boolean;
  otp?: string | undefined;
  otpExpires?: number | undefined;
}

// admin schema methods
export interface IAdminModel extends Model<IAdmin> {
  isAdminExistsById(adminId: string, select?: string): Promise<IAdmin | null>;
  isAdminExistsByEmail(email: string, select?: string): Promise<IAdmin | null>;
}

export interface IAdminDocument extends IAdmin, Document {}
