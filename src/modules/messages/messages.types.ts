import { Message } from "../../types/chat";

export interface GetMessagesRequest {
    conversationId: string;
    cursor?: string;
    limit?: number;
}

export interface CreateMessageRequest {
    body: string;
}

export interface GetMessagesResponse {
    messages: Message[];
    nextCursor: string | null;
}

export interface CreateMessageResponse {
    message: Message;
}
