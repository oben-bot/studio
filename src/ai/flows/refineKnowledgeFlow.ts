'use server';
/**
 * @fileOverview A flow to refine a raw text into a structured knowledge base.
 *
 * - refineKnowledgeFlow - Takes raw text and returns a structured version.
 */

import { ai } from '@/ai/genkit';
import {
  RefineKnowledgeInputSchema,
  RefineKnowledgeOutputSchema,
  type RefineKnowledgeInput,
  type RefineKnowledgeOutput,
} from './schemas';

export async function refineKnowledgeFlow(
  input: RefineKnowledgeInput
): Promise<RefineKnowledgeOutput> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert content strategist. Your task is to take the following raw text and transform it into a clear, well-structured, and easy-to-read knowledge base entry. Use markdown formatting such as headings (#), lists (* or -), and bold text (**) to organize the information effectively. The output should be ready to be used by an AI assistant to answer customer questions.

Raw Text:
---
${input.rawText}
---

Refined Text (using markdown):
`,
    output: {
      schema: RefineKnowledgeOutputSchema,
    },
    config: {
      temperature: 0.3,
    },
  });

  return llmResponse.output || { refinedText: '' };
}
