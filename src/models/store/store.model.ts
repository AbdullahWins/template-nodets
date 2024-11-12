// src/models/store/store.model.ts
import { Schema, model } from "mongoose";
import validator from "validator";
import moment from "moment";
import { IStore, IStoreDocument, IStoreModel } from "../../interfaces";

const StoreSchema = new Schema<IStoreDocument>({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  address: {
    type: String,
    required: [true, "address is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email."],
  },
  phone: {
    type: String,
    required: [true, "phone is required"],
    validate: [validator.isMobilePhone, "Please provide a valid phone number."],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  image: {
    type: String,
    required: [true, "image is required"],
    default: "/public/default/default.png",
  },
  document: {
    type: String,
    required: [true, "document is required"],
    default: "/public/default/default.png",
  },
  role: {
    type: String,
    enum: ["store-admin", "store-manager", "store-staff"],
    default: "store-admin",
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

// checking is store found with the id
StoreSchema.statics.isStoreExistsById = async function (
  storeId: string,
  select: string
): Promise<IStore | null> {
  const store = await this.findById(storeId).select(select).lean();
  return store;
};

// checking is store found with the email
StoreSchema.statics.isStoreExistsByEmail = async function (
  email: string,
  select: string
): Promise<IStore | null> {
  const store = await this.findOne({ email }).select(select).lean();
  return store;
};

const Store = model<IStoreDocument, IStoreModel>("Store", StoreSchema);
export default Store;
