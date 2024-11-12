// src/models/admin/admin.model.ts
import { Schema, model } from "mongoose";
import validator from "validator";
import moment from "moment";
import { IAdmin, IAdminDocument, IAdminModel } from "../../interfaces";

const AdminSchema = new Schema<IAdminDocument>({
  fullName: {
    type: String,
    required: [true, "fullName is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email."],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  profileImage: {
    type: String,
    required: [true, "Password is required"],
    default: "/public/default/default.png",
  },
  role: {
    type: String,
    enum: ["sub-admin", "normal-admin", "super-admin"],
    default: "normal-admin",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Number,
  },
  createdAt: {
    type: Number,
    default: () => moment().unix(),
  },
  updatedAt: {
    type: Number,
    default: () => moment().unix(),
  },
});

// checking is admin found with the id
AdminSchema.statics.isAdminExistsById = async function (
  adminId: string,
  select: string
): Promise<IAdmin | null> {
  const admin = await this.findById(adminId).select(select).lean();
  return admin;
};

// checking is admin found with the email
AdminSchema.statics.isAdminExistsByEmail = async function (
  email: string,
  select: string
): Promise<IAdmin | null> {
  const admin = await this.findOne({ email }).select(select).lean();
  return admin;
};

const Admin = model<IAdminDocument, IAdminModel>("Admin", AdminSchema);
export default Admin;
