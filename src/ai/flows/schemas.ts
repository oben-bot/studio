/**
 * @fileOverview Schemas and types for the chatbot flow.
 */
import { z } from 'zod';

// Chatbot Schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const AiChatbotInputSchema = z.object({
  userId: z.string().describe('El ID del usuario.'),
  currentMessageText: z.string().describe('El mensaje actual del usuario.'),
  chatHistory: z
    .array(ChatMessageSchema)
    .optional()
    .describe('El historial de la conversación.'),
  businessName: z
    .string()
    .describe('El nombre del negocio para el que actúa el chatbot.'),
  knowledge: z.string().describe('La base de conocimiento sobre el negocio.'),
});
export type AiChatbotInput = z.infer<typeof AiChatbotInputSchema>;

export const AiChatbotOutputSchema = z.object({
  response: z.string().describe('La respuesta del chatbot.'),
});
export type AiChatbotOutput = z.infer<typeof AiChatbotOutputSchema>;

// Refine Knowledge Schemas
export const RefineKnowledgeInputSchema = z.object({
  rawText: z.string().describe('The raw, unstructured text to be refined.'),
});
export type RefineKnowledgeInput = z.infer<typeof RefineKnowledgeInputSchema>;

export const RefineKnowledgeOutputSchema = z.object({
  refinedText: z
    .string()
    .describe(
      'The refined, well-structured text, formatted nicely for a knowledge base. Use markdown like headings, lists, and bold text.'
    ),
});
export type RefineKnowledgeOutput = z.infer<
  typeof RefineKnowledgeOutputSchema
>;
