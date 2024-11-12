// src/controllers/user/user.controller.ts
import httpStatus from "http-status";
import { Request, RequestHandler, Response } from "express";
import { User } from "../../models";
import {
  comparePassword,
  generateJwtToken,
  hashPassword,
  sendEmail,
  uploadFiles,
} from "../../services";
import {
  ApiError,
  catchAsync,
  emailProps,
  staticProps,
  sendResponse,
} from "../../utils";
import { IMulterFiles, IUser } from "../../interfaces";
import { UserResponseDto } from "../../dtos";
import { isValidObjectId } from "mongoose";
import { UserLoginDtoZodSchema, UserSignupDtoZodSchema } from "../../dtos";

// signin user
export const SignInUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { email, password: reqPassword } = parsedData as Partial<IUser>;

    // check if email and password exists
    if (!email || !reqPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    //verify zod schema
    const zodValidationResult = UserLoginDtoZodSchema.safeParse(parsedData);
    if (zodValidationResult.error) {
      const errorMessages = zodValidationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages);
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    // check if password is valid
    const isValidPassword = await comparePassword(reqPassword, user.password);
    if (!isValidPassword) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        staticProps.common.INVALID_CREDENTIALS
      );
    }

    // generate token
    const token = generateJwtToken(user);
    const userFromDto = new UserResponseDto(user);

    // updated data
    const updatedData = {
      accessToken: token,
      user: userFromDto,
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.LOGGED_IN,
      data: updatedData,
    });
  }
);

// signup user
export const SignUpUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { email, fullName, username, password } =
      parsedData as Partial<IUser>;
    const { single } = req.files as IMulterFiles;

    // check if data exists
    if (!email || !password || !fullName || !username) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );
    }

    //validate zod schema
    const zodValidationResult = UserSignupDtoZodSchema.safeParse(parsedData);
    if (zodValidationResult.error) {
      const errorMessages = zodValidationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new ApiError(httpStatus.BAD_REQUEST, errorMessages);
    }

    // check if user already exists
    const findUser = await User.isUserExistsByEmail(email);
    if (findUser) {
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
      username,
      password: hashedPassword,
      image: staticProps.default.DEFAULT_IMAGE_PATH,
    };

    //upload file
    if (single) {
      const { filePath } = await uploadFiles(single);
      constructedData = {
        ...constructedData,
        image: filePath || staticProps.default.DEFAULT_IMAGE_PATH,
      };
    }

    // create user
    const user = await User.create(constructedData);

    // generate token
    const token = generateJwtToken(user);

    // email data
    const emailData = {
      email,
      subject: emailProps.subject.WELCOME_USER,
      template: emailProps.template.WELCOME_USER,
      data: { name: fullName },
    };

    // not awaiting for the email to be sent
    sendEmail(emailData);

    // user data
    const userFromDto = new UserResponseDto(user);

    // updated data
    const updatedData = {
      accessToken: token,
      user: userFromDto,
    };

    // send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.CREATED,
      data: updatedData,
    });
  }
);

// get all users
export const GetAllUsers: RequestHandler = catchAsync(async (_req, res) => {
  const users = await User.find().select("-password");

  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const usersFromDto = users.map((user) => new UserResponseDto(user));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: usersFromDto,
  });
});

// get one user
export const GetUserById: RequestHandler = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Validate ID format
  if (!isValidObjectId(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
  }

  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
  }

  const userFromDto = new UserResponseDto(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: staticProps.common.RETRIEVED,
    data: userFromDto,
  });
});

// update one user
export const UpdateUserById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // parsing data and params
    const userId = req.params.userId;
    const parsedData =
      req.body && req.body.data ? JSON.parse(req.body.data) : {};
    const { single } = req.files as IMulterFiles;

    if (!userId || !parsedData)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        staticProps.common.MISSING_REQUIRED_FIELDS
      );

    //get parsed data
    const { password, ...body } = parsedData;

    // Check if a user exists or not
    const existsUser = await User.isUserExistsById(userId, "_id");
    if (!existsUser)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.NOT_FOUND);

    //construct data
    let constructedData = {
      ...body,
    };

    // hash password
    if (password) {
      const hashedPassword = await hashPassword(password);
      constructedData = {
        ...constructedData,
        password: hashedPassword,
      };
    }

    //upload file
    if (single) {
      const { filePath } = await uploadFiles(single);
      constructedData = {
        ...constructedData,
        image: filePath || staticProps.default.DEFAULT_IMAGE_PATH,
      };
    }

    // updating role info
    const data = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: constructedData,
      },
      { new: true, runValidators: true }
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.UPDATED,
      data,
    });
  }
);

// delete one user
export const DeleteUserById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!userId)
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);

    if (!isValidObjectId(userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, staticProps.common.INVALID_ID);
    }

    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, staticProps.common.NOT_FOUND);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: staticProps.common.DELETED,
    });
  }
);
