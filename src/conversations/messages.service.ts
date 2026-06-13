import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InMemoryStore } from '../store/in-memory.store';
import type { Conversation, Message } from '../common/types/chat';

const DEFAULT_MESSAGES_LIMIT = 20;

export interface MessagesPage {
  messages: Message[];
  nextCursor: string | null;
}

@Injectable()
export class MessagesService {
  constructor(private readonly store: InMemoryStore) {}

  listPage(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit?: number,
  ): MessagesPage {
    this.getParticipantConversation(conversationId, userId);

    const thread = [
      ...(this.store.messagesByConversationId.get(conversationId) ?? []),
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const parsedCursor = cursor ? Number(cursor) : 0;
    const startIndex = Number.isFinite(parsedCursor)
      ? Math.max(0, parsedCursor)
      : 0;
    const pageSize = limit ?? DEFAULT_MESSAGES_LIMIT;
    const endIndex = startIndex + pageSize;

    const messages = thread.slice(startIndex, endIndex);
    const nextCursor = endIndex < thread.length ? String(endIndex) : null;

    return { messages, nextCursor };
  }

  create(conversationId: string, senderId: string, body: string): Message {
    const conversation = this.getParticipantConversation(
      conversationId,
      senderId,
    );

    const now = new Date().toISOString();
    const message: Message = {
      id: `m-${randomUUID()}`,
      conversationId,
      senderId,
      body,
      createdAt: now,
      status: 'sent',
    };

    const thread =
      this.store.messagesByConversationId.get(conversationId) ?? [];
    thread.push(message);
    this.store.messagesByConversationId.set(conversationId, thread);

    conversation.updatedAt = now;
    conversation.lastMessage = message;

    return message;
  }

  private getParticipantConversation(
    conversationId: string,
    userId: string,
  ): Conversation {
    const conversation = this.store.conversations.get(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation not found: ${conversationId}`);
    }
    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }
    return conversation;
  }
}
