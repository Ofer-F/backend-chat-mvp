import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError";
import { db } from "../../store/db";
import type { Conversation } from "../../types/chat";
import type { CreateConversationInput } from "./conversations.schema";

export function listForUser(userId: string): Conversation[] {
    return [...db.conversations.values()]
        .filter((conversation) => conversation.participantIds.includes(userId))
        .sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
}

export function create(
    userId: string,
    input: CreateConversationInput,
): Conversation {
    const participantIds = [...new Set([userId, ...input.participantIds])];

    if (participantIds.length < 2) {
        throw AppError.validation(
            "A conversation needs at least one other participant",
        );
    }

    for (const id of participantIds) {
        if (!db.users.has(id)) {
            throw AppError.notFound(`User not found: ${id}`);
        }
    }

    if (participantIds.length === 2) {
        const [a, b] = participantIds;
        const duplicate = [...db.conversations.values()].some(
            (conversation) =>
                conversation.participantIds.length === 2 &&
                conversation.participantIds.includes(a) &&
                conversation.participantIds.includes(b),
        );
        if (duplicate) {
            throw AppError.conflict(
                "A direct conversation between these participants already exists",
            );
        }
    }

    const now = new Date().toISOString();
    const conversation: Conversation = {
        id: `c-${randomUUID()}`,
        title: input.title,
        participantIds,
        lastMessage: null,
        updatedAt: now,
    };

    db.conversations.set(conversation.id, conversation);
    return conversation;
}
