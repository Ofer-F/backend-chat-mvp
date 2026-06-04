import { Conversation } from "../../types/chat";

export interface GetConversationsResponse {
    conversations: Conversation[];
}

export interface CreateConversationResponse {
    conversation: Conversation;
}
