import { User } from "../../types/chat";

export interface LoginRequest {
    userId: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
