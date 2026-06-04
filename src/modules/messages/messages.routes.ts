import { Router } from "express";
import { validateBody } from "../../middleware/validateBody";
import {
    createMessageController,
    listMessagesController,
} from "./messages.controller";
import { createMessageSchema } from "./messages.schema";

export const messagesRouter = Router({ mergeParams: true });

messagesRouter.get("/", listMessagesController);
messagesRouter.post(
    "/",
    validateBody(createMessageSchema),
    createMessageController,
);
