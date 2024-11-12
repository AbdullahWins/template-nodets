// src/models/user/user.model.ts
import { Schema, model } from "mongoose";
import validator from "validator";
import moment from "moment";
import { IUser, IUserDocument, IUserModel } from "../../interfaces";

const UserSchema = new Schema<IUserDocument>({
  fullName: {
    type: String,
    required: [true, "FullName is required"],
  },
  username: {
    type: String,
    required: [true, "Username is required and must be unique."],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email."],
  },
  phone: {
    type: String,
    required: false,
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
  createdAt: {
    type: Number,
    default: () => moment().unix(),
  },
  updatedAt: {
    type: Number,
    default: () => moment().unix(),
  },
});

// checking is user found with the id
UserSchema.statics.isUserExistsById = async function (
  userId: string,
  select: string
): Promise<IUser | null> {
  const user = await this.findById(userId).select(select).lean();
  return user;
};

// checking is user found with the email
UserSchema.statics.isUserExistsByEmail = async function (
  email: string,
  select: string
): Promise<IUser | null> {
  const user = await this.findOne({ email }).select(select).lean();
  return user;
};

const User = model<IUserDocument, IUserModel>("User", UserSchema);
export default User;
