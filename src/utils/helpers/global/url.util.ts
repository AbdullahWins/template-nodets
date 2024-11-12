// src/utils/helpers/global/url.util.ts
import { Request } from "express";
import { environment } from "../../../configs";

export const getRequestFulllUrl = (req: Request) => {
  return "https://" + req.get("host") + req.originalUrl;
};

export const getRequestBaseUrl = (req: Request) => {
  return "https://" + req.get("host");
};

export const getFileUrl = (filePath?: string) => {
  const baseUrl = environment.server.SERVER_BASE_URL;
  if (!filePath) {
    return `${baseUrl}/public/default/default.png`;
  }
  return `${baseUrl}/${filePath.replace(/\\/g, "/")}`;
};
