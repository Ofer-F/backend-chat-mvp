export const ErrorCode = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
    readonly status: number;
    readonly code: ErrorCode;
    readonly details?: unknown;

    constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static validation(message: string, details?: unknown): AppError {
        return new AppError(400, ErrorCode.VALIDATION_ERROR, message, details);
    }

    static unauthorized(message = 'Unauthorized', details?: unknown): AppError {
        return new AppError(401, ErrorCode.UNAUTHORIZED, message, details);
    }

    static forbidden(message = 'Forbidden', details?: unknown): AppError {
        return new AppError(403, ErrorCode.FORBIDDEN, message, details);
    }

    static notFound(message = 'Not found', details?: unknown): AppError {
        return new AppError(404, ErrorCode.NOT_FOUND, message, details);
    }

    static conflict(message: string, details?: unknown): AppError {
        return new AppError(409, ErrorCode.CONFLICT, message, details);
    }

    static internal(message = 'Internal server error', details?: unknown): AppError {
        return new AppError(500, ErrorCode.INTERNAL, message, details);
    }
}
