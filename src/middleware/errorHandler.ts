import { AppError, ErrorCode } from "../errors/AppError";
import type { NextFunction, Request, Response } from "express";

interface ErrorBody {
    error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
    };
}

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response<ErrorBody>,
    _next: NextFunction,
): void => {
    if (err instanceof AppError) {
        const body: ErrorBody = {
            error: { code: err.code, message: err.message },
        };
        if (err.details !== undefined) {
            body.error.details = err.details;
        }
        res.status(err.status).json(body);
        return;
    }

    console.error("Unhandled error:", err);
    res.status(500).json({
        error: {
            code: ErrorCode.INTERNAL,
            message: "Internal server error",
        },
    });
};
