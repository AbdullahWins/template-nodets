// src/interfaces/product/product.interface.ts
import { Model, Schema } from "mongoose";
import { ICommonSchema } from "../common/common.interface";

// product interface
export interface IProduct extends ICommonSchema {
  _id: string;
  name: string;
  image: string;
  game: Schema.Types.ObjectId;
}

// product schema methods
export interface IProductModel extends Model<IProduct> {
  isProductExistsById(
    productId?: string,
    name?: string,
    select?: string
  ): Promise<IProduct | null>;
}

export interface IProductDocument extends IProduct, Document {}
