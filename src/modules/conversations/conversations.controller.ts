import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { getAuthUser } from "../../middleware/auth";
import { create, listForUser } from "./conversations.service";
import type { CreateConversationInput } from "./conversations.schema";
import type {
    CreateConversationResponse,
    GetConversationsResponse,
} from "./conversations.types";

export function listConversationsController(
    req: Request,
    res: Response<GetConversationsResponse>,
): void {
    const user = getAuthUser(req);
    const conversations = listForUser(user.id);
    res.status(200).json({ conversations });
}

export function createConversationController(
    req: Request<ParamsDictionary, CreateConversationResponse, CreateConversationInput>,
    res: Response<CreateConversationResponse>,
): void {
    const user = getAuthUser(req);
    const conversation = create(user.id, req.body);
    res.status(201).json({ conversation });
}
