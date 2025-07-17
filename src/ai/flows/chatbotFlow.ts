'use server';
/**
 * @fileOverview A chatbot flow for the BotForge application.
 *
 * - chatbotFlow - A function that generates a chatbot response.
 */

import { ai } from '@/ai/genkit';
import { ChatbotInput, ChatbotInputSchema, ChatMessageSchema } from './schemas';

const prompt = `
You are a customer service chatbot for a business called "{{businessName}}".
Your personality should be helpful, friendly, and professional.
Your goal is to answer customer questions based *only* on the information provided in the "KNOWLEDGE BASE" below.
Do not make up information or answer questions that are not related to the knowledge base.
If the answer is not in the knowledge base, politely say that you don't have that information.
Keep your answers concise and to the point.

KNOWLEDGE BASE:
---
{{knowledge}}
---

Here is the conversation history with the user so far:
{{#each history}}
{{role}}: {{content}}
{{/each}}
bot:
`;

export async function chatbotFlow(input: ChatbotInput): Promise<string> {
  const llmResponse = await ai.generate({
    prompt: prompt,
    history: input.history,
    input: {
      businessName: input.businessName,
      knowledge: input.knowledge,
    },
    config: {
      temperature: 0.3, // Lower temperature for more factual, less creative answers
    },
  });

  return llmResponse.text;
}
