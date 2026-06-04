import type { Request, RequestHandler } from "express";
import { AppError } from "../errors/AppError";
import { db } from "../store/db";
import type { User } from "../types/chat";

const BEARER_PREFIX = "Bearer ";
const TOKEN_PREFIX = "mock-token-";

export const requireAuth: RequestHandler = (req, _res, next): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith(BEARER_PREFIX)) {
        throw AppError.unauthorized("Missing or malformed Authorization header");
    }

    const token = header.slice(BEARER_PREFIX.length).trim();
    if (!token.startsWith(TOKEN_PREFIX)) {
        throw AppError.unauthorized("Invalid token");
    }

    const userId = token.slice(TOKEN_PREFIX.length);
    const user = db.users.get(userId);
    if (!user) {
        throw AppError.unauthorized("Invalid token");
    }

    req.user = user;
    next();
};

export function getAuthUser(req: Request): User {
    if (!req.user) {
        throw AppError.unauthorized();
    }
    return req.user;
}
