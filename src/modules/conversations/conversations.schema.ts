import { z } from "zod";

export const createConversationSchema = z.object({
    title: z.string().min(1),
    participantIds: z.array(z.string().min(1)).min(1),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
