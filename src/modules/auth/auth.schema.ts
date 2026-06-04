import { z } from "zod";

/**
 * Validation for `POST /auth/login`. `userId` must be a non-empty string;
 * empty/missing values fail here and surface as a 400 via the error handler.
 */
export const loginSchema = z.object({
    userId: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
