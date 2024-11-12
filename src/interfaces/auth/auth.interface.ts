// src/interfaces/auth/auth.interface.ts
import { Document } from "mongoose";
import { AdminRoles, StoreRoles, UserRoles } from "../../utils";
import { IUser } from "../user/user.interface";
import { IAdmin } from "../admin/admin.interface";
import { IStore } from "../store/store.interface";

// Define the role types using your constants
export type AdminRole = (typeof AdminRoles)[keyof typeof AdminRoles];
export type StoreRole = (typeof StoreRoles)[keyof typeof StoreRoles];
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

// Combined Role type
export type Role = AdminRole | StoreRole | UserRole;

// Mongoose document types
export type UserDocument = Document & IUser;
export type AdminDocument = Document & IAdmin;
export type StoreDocument = Document & IStore;

// Type for accessing user (User, Admin, Store)
export type AccessingUserType = UserDocument | AdminDocument | StoreDocument;
