import { AppError } from "../../errors/AppError";
import { db } from "../../store/db";
import { LoginResponse } from "./auth.types";

/**
 * Fake login (no real auth this week): looks up the user by id and issues a
 * deterministic mock token. Throws 404 if the user doesn't exist so the caller
 * can't mint tokens for unknown ids.
 */
export function login(userId: string): LoginResponse {
    const user = db.users.get(userId);
    if (!user) {
        throw AppError.notFound(`User not found: ${userId}`);
    }

    return {
        token: `mock-token-${user.id}`,
        user,
    };
}
