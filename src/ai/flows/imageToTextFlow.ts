'use server';
/**
 * @fileOverview A flow to extract text from an image.
 *
 * - imageToTextFlow - A function that takes an image and returns the text.
 * - ImageToTextInput - The input type for the imageToTextFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

export async function imageToTextFlow(input: ImageToTextInput): Promise<string> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: [
        { text: 'Extract all visible text from this image. If there is no text, describe the image briefly.' },
        { media: { url: input.photoDataUri } },
    ],
    config: {
      temperature: 0.1,
    },
  });

  return llmResponse.text;
}
