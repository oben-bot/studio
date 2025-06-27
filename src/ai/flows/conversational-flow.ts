'use server';
/**
 * @fileOverview A conversational flow that generates a vector image from a text prompt.
 *
 * - processUserPrompt - A function that takes a user's text prompt, generates an image, and then vectorizes it.
 * - ProcessUserPromptInput - The input type for the processUserPrompt function.
 * - ProcessUserPromptOutput - The return type for the processUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { vectorizeImage, VectorizeImageInput } from './vectorize-image-flow';

const ProcessUserPromptInputSchema = z.object({
  prompt: z.string().describe('The user\'s text description of the image to generate.'),
  detailLevel: z.number().min(0).max(100),
  smoothness: z.number().min(0).max(100),
  removeBackground: z.boolean(),
  singlePath: z.boolean(),
});
export type ProcessUserPromptInput = z.infer<typeof ProcessUserPromptInputSchema>;

const ProcessUserPromptOutputSchema = z.object({
  svgString: z.string().describe('The vectorized image as a valid, well-formed SVG string.'),
});
export type ProcessUserPromptOutput = z.infer<typeof ProcessUserPromptOutputSchema>;


export async function processUserPrompt(input: ProcessUserPromptInput): Promise<ProcessUserPromptOutput> {
  return conversationalFlow(input);
}

const conversationalFlow = ai.defineFlow(
  {
    name: 'conversationalFlow',
    inputSchema: ProcessUserPromptInputSchema,
    outputSchema: ProcessUserPromptOutputSchema,
  },
  async (input) => {
    // Step 1: Generate a raster image from the text prompt.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a clean, high-contrast, black and white image suitable for vectorization and laser cutting, based on the following description: "${input.prompt}". The main subject should be clearly defined against a plain white background.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate an image from the prompt.');
    }

    // Step 2: Vectorize the generated raster image.
    const vectorizeInput: VectorizeImageInput = {
        imageDataUri: media.url, // data URI from the image generation
        detailLevel: input.detailLevel,
        smoothness: input.smoothness,
        removeBackground: input.removeBackground,
        singlePath: input.singlePath,
    };

    const vectorizationResult = await vectorizeImage(vectorizeInput);

    if (!vectorizationResult.svgString) {
      throw new Error('Failed to vectorize the generated image.');
    }
    
    return { svgString: vectorizationResult.svgString };
  }
);
