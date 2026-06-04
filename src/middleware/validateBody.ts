import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/AppError";

export const validateBody = <T>(schema: ZodType<T>): RequestHandler =>
    (req, _res, next): void => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            throw AppError.validation("Invalid request body", parsed.error.issues);
        }
        req.body = parsed.data;
        next();
    };
