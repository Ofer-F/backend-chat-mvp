import { Injectable } from '@nestjs/common';
import type { Conversation, Message, User } from '../common/types/chat';

@Injectable()
export class InMemoryStore {
  readonly users = new Map<string, User>();
  readonly conversations = new Map<string, Conversation>();
  readonly messagesByConversationId = new Map<string, Message[]>();
}
