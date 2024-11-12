// src/types/index.d.ts
import { JwtPayload } from "jsonwebtoken";
import { IMulterFiles } from "../interfaces";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
      file: any;
      files: any;
    }
  }
}
