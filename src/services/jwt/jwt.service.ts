// src/services/jwt/jwt.service.ts
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { IUser } from "../../interfaces";
import { environment } from "../../configs";

export const generateJwtToken = (data: Partial<IUser>): string => {
  const payload = {
    _id: data._id,
  };

  // token generating
  const token = jwt.sign(
    payload,
    environment.jwt.JWT_ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: environment.jwt.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    }
  );

  return token;
};

export const verifyJwtToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
