import { Response } from "express";

export default function customError(res: Response, statusCode: number, errorCode: string, errorDescription: string): Response {
  return res.status(statusCode).json({
    error_code: errorCode,
    error_description: errorDescription
  });
}