import { randomUUID } from "node:crypto";
import { config } from "../../config";
import { AppError } from "../../errors/AppError";
import { db } from "../../store/db";
import type { Conversation, Message } from "../../types/chat";
import type { GetMessagesResponse } from "./messages.types";

function getParticipantConversation(
    conversationId: string,
    userId: string,
): Conversation {
    const conversation = db.conversations.get(conversationId);
    if (!conversation) {
        throw AppError.notFound(`Conversation not found: ${conversationId}`);
    }
    if (!conversation.participantIds.includes(userId)) {
        throw AppError.forbidden("You are not a participant in this conversation");
    }
    return conversation;
}

export function listPage(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit?: number,
): GetMessagesResponse {
    getParticipantConversation(conversationId, userId);

    const thread = [...(db.messages.get(conversationId) ?? [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const parsedCursor = cursor ? Number(cursor) : 0;
    const startIndex = Number.isFinite(parsedCursor)
        ? Math.max(0, parsedCursor)
        : 0;
    const pageSize = limit ?? config.DEFAULT_MESSAGES_LIMIT;
    const endIndex = startIndex + pageSize;

    const messages = thread.slice(startIndex, endIndex);
    const nextCursor = endIndex < thread.length ? String(endIndex) : null;

    return { messages, nextCursor };
}

export function create(
    conversationId: string,
    senderId: string,
    body: string,
): Message {
    const conversation = getParticipantConversation(conversationId, senderId);

    const now = new Date().toISOString();
    const message: Message = {
        id: `m-${randomUUID()}`,
        conversationId,
        senderId,
        body,
        createdAt: now,
        status: "sent",
    };

    const thread = db.messages.get(conversationId) ?? [];
    thread.push(message);
    db.messages.set(conversationId, thread);

    conversation.updatedAt = now;
    conversation.lastMessage = message;

    return message;
}
