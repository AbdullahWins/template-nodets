// src/controllers/admin/admin.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { Admin } from "../../models";
import {
  comparePassword,
  generateJwtToken,
  hashPassword,
  sendEmail,
  uploadFiles,
  validateZodSchema,
} from "../../services";
import {
  ApiError,
  catchAsync,
  emailProps,
  staticProps,
  sendResponse,
} from "../../utils";
import { IMulterFiles, IAdmin } from "../../interfaces";
import { AdminResponseDto, AdminSignupDtoZodSchema } from "../../dtos";
import { isValidObjectId } from "mongoose";

// signin admin
export const SignInAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { email, password: reqPassword } = parsedData as Partial<IAdmin>;

    // check if email and password exists
    if (!email || !reqPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        staticProps.common.ALREADY_EXISTS
      );
    }

    // check if password is valid
    const isValidPassword = await comparePassword(reqPassword, admin.password);
    if (!isValidPassword) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        staticProps.common.INVALID_CREDENTIALS
      );
    }

    // generate token
    const token = generateJwtToken(admin);
    const adminFromDto = new AdminResponseDto(admin);

    // updated data
    const updatedData = {
      accessToken: token,
      admin: adminFromDto,
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.LOGGED_IN,
      data: updatedData,
    });
  }
);

// signup admin
export const SignUpAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { email, fullName, password, role } = parsedData as Partial<IAdmin>;
    const { single } = req.files as IMulterFiles;

    // check if data exists
    if (!email || !password || !fullName) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    // validate data with zod schema
    validateZodSchema(AdminSignupDtoZodSchema, parsedData);

    // check if admin already exists
    const findAdmin = await Admin.isAdminExistsByEmail(email);
    if (findAdmin) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.ALREADY_EXISTS
      );
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // data to be stored
    let constructedData = {
      email,
      fullName,
      password: hashedPassword,
      image: staticProps.default.DEFAULT_IMAGE_PATH,
      role,
    };

    // Upload files
    if (single) {
      const { filePath } = await uploadFiles(single);
      constructedData = {
        ...constructedData,
        image: filePath || staticProps.default.DEFAULT_IMAGE_PATH,
      };
    }

    // create admin
    const admin = await Admin.create(constructedData);

    // generate token
    const token = generateJwtToken(admin);

    // email data
    const emailData = {
      email,
      subject: emailProps.subject.WELCOME_ADMIN,
      template: emailProps.template.WELCOME_ADMIN,
      data: { name: fullName },
    };

    // not awaiting for the email to be sent
    sendEmail(emailData);

    // admin data
    const adminFromDto = new AdminResponseDto(admin);

    // updated data
    const updatedData = {
      accessToken: token,
      admin: adminFromDto,
    };

    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.CREATED,
      data: updatedData,
    });
  }
);

// get all admins
export const GetAllAdmins: RequestHandler = catchAsync(async (_req, res) => {
  const admins = await Admin.find().select("-password");

  if (!admins) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const adminsFromDto = admins.map((admin) => new AdminResponseDto(admin));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: adminsFromDto,
  });
});

// get one admin
export const GetAdminById: RequestHandler = catchAsync(async (req, res) => {
  const { adminId } = req.params;

  // Validate ID format
  if (!isValidObjectId(adminId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const admin = await Admin.findOne({ _id: adminId }).select("-password");

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const adminFromDto = new AdminResponseDto(admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: adminFromDto,
  });
});

// update one admin
export const UpdateAdminById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const adminId = req.params.adminId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { single } = req.files as IMulterFiles;

    if (!adminId || !parsedData)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    //get parsed data
    const { password, ...body } = parsedData;

    // Check if a admin exists or not
    const existsAdmin = await Admin.isAdminExistsById(adminId, "_id");
    if (!existsAdmin)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    // Create updated data object conditionally based on the paths returned
    let constructedData: any = {
      ...body,
    };

    if (password) {
      const hashedPassword = await hashPassword(password);
      constructedData = {
        ...constructedData,
        password: hashedPassword,
      };
    }

    // Upload files
    if (single) {
      const { filePath } = await uploadFiles(single);
      constructedData = {
        ...constructedData,
        image: filePath || staticProps.default.DEFAULT_IMAGE_PATH,
      };
    }

    // updating role info
    const data = await Admin.findOneAndUpdate(
      { _id: adminId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    //process data
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    const adminFromDto = new AdminResponseDto(data);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data: adminFromDto,
    });
  }
);

// delete one admin
export const DeleteAdminById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.params.adminId;

    if (!adminId)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    if (!isValidObjectId(adminId)) {
      // Ensure the statusCode is set when throwing ApiError for invalid ID
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
    }

    const result = await Admin.deleteOne({ _id: adminId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
