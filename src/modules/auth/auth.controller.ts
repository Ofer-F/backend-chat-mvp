import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { login } from "./auth.service";
import type { LoginInput } from "./auth.schema";
import type { LoginResponse } from "./auth.types";

/**
 * POST /auth/login. Body is already validated by `validateBody(loginSchema)`,
 * so `req.body` is a typed `LoginInput` here. Delegates to the auth service
 * (404 on unknown user) and returns the token + user.
 */
export function loginController(
    req: Request<ParamsDictionary, LoginResponse, LoginInput>,
    res: Response<LoginResponse>,
): void {
    const result = login(req.body.userId);
    res.status(200).json(result);
}
