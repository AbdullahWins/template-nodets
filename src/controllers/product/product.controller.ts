// src/controllers/product/product.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { Product } from "../../models";
import { catchAsync, staticProps, sendResponse, ApiError } from "../../utils";
import { ProductAddDtoZodSchema, ProductResponseDto } from "../../dtos";
import { isValidObjectId } from "mongoose";
import { IPrize } from "../../interfaces";
import { validateZodSchema } from "../../services";

// get all products
export const GetAllProducts: RequestHandler = catchAsync(async (_req, res) => {
  const products = await Product.find();

  if (products.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const productsFromDto = products.map(
    (product) => new ProductResponseDto(product)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: productsFromDto,
  });
});

// get one product
export const GetProductById: RequestHandler = catchAsync(async (req, res) => {
  const { productId } = req.params;

  // Validate ID format
  if (!isValidObjectId(productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const productFromDto = new ProductResponseDto(product);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: productFromDto,
  });
});

// create one product
export const AddOneProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Parsing data
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { name, totalNumbers, price, prize } = parsedData;

    // Validate required fields
    if (!name || !totalNumbers || !price || !prize)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    // Ensure prize array has the correct structure
    const formattedPrize: IPrize[] = prize.map((prize: IPrize) => ({
      match: prize.match || 0,
      amount: prize.amount || 0,
    }));

    // validate data with zod schema
    validateZodSchema(ProductAddDtoZodSchema, parsedData);

    const constructedData = {
      name,
      totalNumbers,
      price,
      prize: formattedPrize,
    };

    // Create new product
    const productData = await Product.create(constructedData);

    if (!productData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    const productFromDto = new ProductResponseDto(productData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: staticProps.common.CREATED,
      data: productFromDto,
    });
  }
);

// update one product
export const UpdateProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const productId = req.params.productId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};

    //get parsed data
    const { name, totalNumbers, price, prize } = parsedData;

    if (!productId) {
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
    }

    if (!name && !totalNumbers && !price && !prize) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // Check if a product exists or not
    const existsProduct = await Product.isProductExistsById(productId, "_id");
    if (!existsProduct)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    //construct data
    let constructedData = {
      name,
      totalNumbers,
      price,
      prize,
    };

    // updating role info
    const productData = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    //process the product data
    if (!productData) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }
    const productFromDto = new ProductResponseDto(productData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data: productFromDto,
    });
  }
);

// delete one product
export const DeleteProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;

    if (!productId)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);

    const result = await Product.deleteOne({ _id: productId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
