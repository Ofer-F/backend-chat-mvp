import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const notFound: RequestHandler = (req, _res, next): void => {
    next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};