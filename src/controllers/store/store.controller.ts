// src/controllers/store/store.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { Store } from "../../models";
import {
  comparePassword,
  generateJwtToken,
  generateOtp,
  hashPassword,
  otpExpiresIn,
  sendEmail,
  uploadFiles,
  validateOtp,
  validateZodSchema,
} from "../../services";
import {
  ApiError,
  catchAsync,
  emailProps,
  staticProps,
  sendResponse,
} from "../../utils";
import { IMulterFiles, IStore } from "../../interfaces";
import { StoreResponseDto, StoreSignupDtoZodSchema } from "../../dtos";
import { isValidObjectId } from "mongoose";

// Updated sign-in function with OTP generation
export const SignInStore: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData = req.body?.data ? JSON.parse(req.body.data) : {};
    const { email, password: reqPassword } = parsedData as Partial<IStore>;

    // Check if email and password exist
    if (!email || !reqPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // Check if store exists
    const store = await Store.findOne({ email });
    if (!store) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    // Check if password is valid
    const isValidPassword = await comparePassword(reqPassword, store.password);
    if (!isValidPassword) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        staticProps.common.INVALID_CREDENTIALS
      );
    }

    // Generate OTP
    const otp = await generateOtp();
    const hashedOtp = await hashPassword(otp); // Hash OTP before storing

    // Store OTP and expiration in the database
    store.otp = hashedOtp;
    store.otpExpires = otpExpiresIn(); // 5 minutes expiration
    await store.save();

    // email data
    const emailData = {
      email,
      subject: emailProps.subject.VERIFY_2FA,
      template: emailProps.template.VERIFY_2FA,
      data: { name: store.name, otp: otp },
    };

    // not awaiting for the email to be sent
    sendEmail(emailData);

    // awaiting for the email to be sent
    // const otpResult = await sendEmail(emailData);
    // if (!otpResult) {
    //   throw new ApiError(
    //     httpStatus.INTERNAL_SERVER_ERROR,
    //     staticProps.email.EMAIL_NOT_SENT
    //   );
    // }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.otp.OTP_SENT,
      data: null,
    });
  }
);

export const VerifyOtp: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData = req.body?.data ? JSON.parse(req.body.data) : {};
    const { email, otp } = parsedData as Partial<IStore>;

    if (!email || !otp) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // Check if store exists
    const store = await Store.findOne({ email });
    if (!store) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    // Check if OTP is valid
    if (!store.otp || !store.otpExpires) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        staticProps.common.INVALID_CREDENTIALS
      );
    }

    // Check if OTP is expired
    const isValidOtp = await validateOtp(otp, store.otp, store.otpExpires);
    if (!isValidOtp.isMatched) {
      throw new ApiError(httpStatus.UNAUTHORIZED, isValidOtp.message);
    }

    const isCorrectOtp = await comparePassword(otp, store.otp);
    if (!isCorrectOtp) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        staticProps.common.INVALID_CREDENTIALS
      );
    }

    // Clear OTP and expiration
    store.otp = undefined;
    store.otpExpires = undefined;
    await store.save();

    //generate token
    const token = generateJwtToken(store);
    //process the data
    const storeFromDto = new StoreResponseDto(store);

    const updatedData = {
      accessToken: token,
      store: storeFromDto,
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: staticProps.otp.OTP_VERIFIED,
      data: updatedData,
    });
  }
);

// add store
export const AddOneStore: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { name, address, email, phone, password, role } =
      parsedData as Partial<IStore>;
    const { single, document } = req.files as IMulterFiles;

    // check if data exists
    if (!name || !address || !email || !phone || !password) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // validate data with zod schema
    validateZodSchema(StoreSignupDtoZodSchema, parsedData);

    // check if store already exists
    const findStore = await Store.isStoreExistsByEmail(email);
    if (findStore) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.ALREADY_EXISTS
      );
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // data to be stored
    let updatedData = {
      name,
      address,
      email,
      phone,
      password: hashedPassword,
      image: staticProps.default.DEFAULT_IMAGE_PATH,
      document: staticProps.default.DEFAULT_DOCUMENT_PATH,
      role,
    };

    // Upload files
    if (single || document) {
      const { filePath, documentPath } = await uploadFiles(single, document);
      updatedData = {
        ...updatedData,
        image: filePath || staticProps.default.DEFAULT_IMAGE_PATH,
        document: documentPath || staticProps.default.DEFAULT_DOCUMENT_PATH,
      };
    }

    // create store
    const store = await Store.create(updatedData);

    // email data
    const emailData = {
      email,
      subject: emailProps.subject.WELCOME_STORE,
      template: emailProps.template.WELCOME_STORE,
      data: { name: name, email: email, password: password },
    };

    // not awaiting for the email to be sent
    sendEmail(emailData);

    // store data
    const storeFromDto = new StoreResponseDto(store);

    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.CREATED,
      data: storeFromDto,
    });
  }
);

// get all stores
export const GetAllStores: RequestHandler = catchAsync(async (_req, res) => {
  const stores = await Store.find().select("-password");

  if (!stores) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const storesFromDto = stores.map((store) => new StoreResponseDto(store));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: storesFromDto,
  });
});

// get one store
export const GetStoreById: RequestHandler = catchAsync(async (req, res) => {
  const { storeId } = req.params;

  // Validate ID format
  if (!isValidObjectId(storeId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const store = await Store.findOne({ _id: storeId }).select("-password");

  if (!store) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const storeFromDto = new StoreResponseDto(store);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: storeFromDto,
  });
});

// update one store
export const UpdateStoreById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const storeId = req.params.storeId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { single, document } = req.files as IMulterFiles;
    console.log("req.files", req.files);

    if (!storeId || !parsedData)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    // Check if a store exists or not
    const existsStore = await Store.isStoreExistsById(storeId, "_id");
    if (!existsStore)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    // Get parsed data
    const { password, ...body } = parsedData;

    // Create updated data object conditionally based on the paths returned
    let constructedData: any = {
      ...body,
    };

    //hash password if password exists
    if (password) {
      const hashedPassword = await hashPassword(password);
      constructedData = { ...constructedData, password: hashedPassword };
    }

    // Upload files
    if (single || document) {
      const { filePath, documentPath } = await uploadFiles(single, document);
      constructedData = {
        ...constructedData,
        image: filePath,
        document: documentPath,
      };
    }

    // Updating role info
    const data = await Store.findOneAndUpdate(
      { _id: storeId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    // Process the data
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    const storeFromDto = new StoreResponseDto(data);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data: storeFromDto,
    });
  }
);

// delete one store
export const DeleteStoreById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const storeId = req.params.storeId;

    if (!storeId)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    const result = await Store.deleteOne({ _id: storeId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
