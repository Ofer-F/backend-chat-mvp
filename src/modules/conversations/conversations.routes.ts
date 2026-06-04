import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateBody";
import {
    createConversationController,
    listConversationsController,
} from "./conversations.controller";
import { createConversationSchema } from "./conversations.schema";
import { messagesRouter } from "../messages/messages.routes";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.get("/", listConversationsController);
conversationsRouter.post(
    "/",
    validateBody(createConversationSchema),
    createConversationController,
);

conversationsRouter.use("/:id/messages", messagesRouter);
