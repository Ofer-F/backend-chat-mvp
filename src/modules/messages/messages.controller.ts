import type { Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import { getAuthUser } from "../../middleware/auth";
import { create, listPage } from "./messages.service";
import {
    getMessagesQuerySchema,
    type CreateMessageInput,
} from "./messages.schema";
import type {
    CreateMessageResponse,
    GetMessagesResponse,
} from "./messages.types";

export function listMessagesController(
    req: Request<{ id: string }>,
    res: Response<GetMessagesResponse>,
): void {
    const user = getAuthUser(req);

    const parsedQuery = getMessagesQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
        throw AppError.validation(
            "Invalid query parameters",
            parsedQuery.error.issues,
        );
    }

    const { cursor, limit } = parsedQuery.data;
    const result = listPage(req.params.id, user.id, cursor, limit);
    res.status(200).json(result);
}

export function createMessageController(
    req: Request<{ id: string }, CreateMessageResponse, CreateMessageInput>,
    res: Response<CreateMessageResponse>,
): void {
    const user = getAuthUser(req);
    const message = create(req.params.id, user.id, req.body.body);
    res.status(201).json({ message });
}
