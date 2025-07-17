'use server';
/**
 * @fileOverview A chatbot flow for the BotForge application.
 *
 * - chatbotFlow - A function that generates a chatbot response.
 */

import { ai } from '@/ai/genkit';
import { type ChatbotInput } from './schemas';

const prompt = `
Eres un chatbot de servicio al cliente para un negocio llamado "{{businessName}}".
Tu personalidad debe ser servicial, amigable y profesional.
Tu objetivo es responder a las preguntas de los clientes basándote *únicamente* en la información proporcionada en la "BASE DE CONOCIMIENTO" a continuación.
No inventes información ni respondas preguntas que no estén relacionadas con la base de conocimiento.
Si la respuesta no se encuentra en la base de conocimiento, indica amablemente que no tienes esa información.
Mantén tus respuestas concisas y al punto.

BASE DE CONOCIMIENTO:
---
{{knowledge}}
---

Este es el historial de la conversación con el usuario hasta ahora:
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
      temperature: 0.3, // Temperatura más baja para respuestas más factuales y menos creativas
    },
  });

  return llmResponse.text;
}
