/**
 * @fileOverview Schemas and types for the chatbot flow.
 */
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatbotInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The chat history.'),
  knowledge: z.string().describe('The knowledge base for the business.'),
  businessName: z.string().describe('The name of the business.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;
