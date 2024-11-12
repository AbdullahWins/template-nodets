// src/middleware/authMiddleware.ts

import { NextFunction, Request, Response } from "express";
import {
  JwtPayload,
  Secret,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";
import httpStatus from "http-status";
import { verifyJwtToken } from "../../services";
import { environment } from "../../configs";
import { ApiError, authProps, staticProps } from "../../utils";
import { User, Admin, Store } from "../../models";
import { AccessingUserType, Role } from "../../interfaces";

export const authMiddleware =
  (roles?: Role[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          staticProps.jwt.TOKEN_NOT_FOUND
        );
      }

      // Extract token
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          staticProps.jwt.INVALID_TOKEN
        );
      }

      // Verify the token
      let verifiedUser: JwtPayload;
      try {
        verifiedUser = verifyJwtToken(
          token,
          environment.jwt.JWT_ACCESS_TOKEN_SECRET as Secret
        ) as JwtPayload;
      } catch (error) {
        // Handle specific JWT errors
        if (error instanceof TokenExpiredError) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            staticProps.jwt.TOKEN_EXPIRED
          );
        } else if (error instanceof JsonWebTokenError) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            staticProps.jwt.INVALID_TOKEN
          );
        } else if (error instanceof NotBeforeError) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            staticProps.jwt.TOKEN_NOT_ACTIVE
          );
        } else {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            staticProps.jwt.INVALID_TOKEN
          );
        }
      }

      // Initialize user and role
      let accessingUser: AccessingUserType | null = null;
      let role: Role | undefined;

      // If no roles specified, allow all roles
      const allowedRoles = roles ?? authProps.ALL;

      // First try to find user if user role is allowed
      if (allowedRoles.includes("user")) {
        accessingUser = await User.findById(verifiedUser._id);
        if (accessingUser) {
          role = "user";
        }
      }

      // If not found as user and admin roles are allowed, try finding as admin
      if (!accessingUser) {
        accessingUser = await Admin.findById(verifiedUser._id);
        if (accessingUser && "role" in accessingUser) {
          role = accessingUser.role as Role;
        }
      }

      // If not found as user or admin, try finding as store staff
      if (!accessingUser) {
        accessingUser = await Store.findById(verifiedUser._id);
        if (accessingUser && "role" in accessingUser) {
          role = accessingUser.role as Role;
        }
      }

      // If no valid user/admin/store found
      if (!accessingUser || !role) {
        throw new ApiError(httpStatus.FORBIDDEN, staticProps.common.FORBIDDEN);
      }

      // Check if the user's role is among the allowed roles
      if (!allowedRoles.includes(role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Forbidden: Required roles '${allowedRoles.join(
            ", "
          )}' but found '${role}'`
        );
      }

      // Log access
      console.log(
        `User: ${accessingUser.email}\nRole: ${role} accessed the route`
      );

      // Attach user to request
      req.user = { ...accessingUser.toObject(), role };
      next();
    } catch (error) {
      next(error);
    }
  };
