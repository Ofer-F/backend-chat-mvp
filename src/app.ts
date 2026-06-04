import cors from "cors";
import express, { type Express } from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import { authRouter } from "./modules/auth/auth.routes";
import { conversationsRouter } from "./modules/conversations/conversations.routes";

export function createApp(): Express {
    const app = express();

    app.use(requestLogger);
    app.use(cors({ origin: config.CORS_ORIGIN }));
    app.use(express.json());

    app.use("/auth", authRouter);
    app.use("/conversations", conversationsRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
