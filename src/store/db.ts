import type { Conversation, Message, User } from "../types/chat";


export const db = {
    users: new Map<string, User>(),
    conversations: new Map<string, Conversation>(),
    messages: new Map<string, Message[]>(),
} as const;
