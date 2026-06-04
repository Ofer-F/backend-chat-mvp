import { z } from "zod";

export const createMessageSchema = z.object({
    body: z.string().min(1),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const getMessagesQuerySchema = z.object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().positive().optional(),
});

export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
