import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InMemoryStore } from '../store/in-memory.store';
import type { Conversation } from '../common/types/chat';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly store: InMemoryStore) {}

  listForUser(userId: string): Conversation[] {
    return [...this.store.conversations.values()]
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  create(userId: string, input: CreateConversationDto): Conversation {
    const title = input.title.trim();
    const participantIds = [...new Set([userId, ...input.participantIds])];

    if (!title) {
      throw new BadRequestException('Conversation title is required');
    }

    if (participantIds.length < 2) {
      throw new BadRequestException(
        'A conversation needs at least one other participant',
      );
    }

    for (const id of participantIds) {
      if (!this.store.users.has(id)) {
        throw new NotFoundException(`User not found: ${id}`);
      }
    }

    if (participantIds.length === 2) {
      const [a, b] = participantIds;
      const duplicate = [...this.store.conversations.values()].some(
        (conversation) =>
          conversation.participantIds.length === 2 &&
          conversation.participantIds.includes(a) &&
          conversation.participantIds.includes(b),
      );
      if (duplicate) {
        throw new ConflictException(
          'A direct conversation between these participants already exists',
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

    this.store.conversations.set(conversation.id, conversation);
    return conversation;
  }
}
