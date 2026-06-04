import type { User } from "./chat";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
