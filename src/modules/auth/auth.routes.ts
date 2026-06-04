import { Router } from "express";
import { validateBody } from "../../middleware/validateBody";
import { loginController } from "./auth.controller";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), loginController);
