'use server';
/**
 * @fileOverview A flow for vectorizing an image using AI.
 *
 * - vectorizeImage - A function that handles the image vectorization process.
 * - VectorizeImageInput - The input type for the vectorizeImage function.
 * - VectorizeImageOutput - The return type for the vectorizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VectorizeImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo to vectorize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  detailLevel: z.number().min(0).max(100).describe('The level of detail to retain, from 0 (less) to 100 (more).'),
  smoothness: z.number().min(0).max(100).describe('The amount of curve smoothing, from 0 (angular) to 100 (smooth).'),
  removeBackground: z.boolean().describe('Whether to remove the background from the image.'),
  singlePath: z.boolean().describe('Whether to combine all shapes into a single path.'),
});
export type VectorizeImageInput = z.infer<typeof VectorizeImageInputSchema>;

const VectorizeImageOutputSchema = z.object({
  svgString: z.string().describe('The vectorized image as a valid, well-formed SVG string. This string should start with "<svg..." and end with "</svg>". It must be suitable for laser cutting.'),
});
export type VectorizeImageOutput = z.infer<typeof VectorizeImageOutputSchema>;

export async function vectorizeImage(input: VectorizeImageInput): Promise<VectorizeImageOutput> {
  return vectorizeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vectorizeImagePrompt',
  input: {schema: VectorizeImageInputSchema},
  output: {schema: VectorizeImageOutputSchema},
  prompt: `You are an expert in converting raster images into clean, monochrome, single-path SVG vector graphics suitable for laser cutting and engraving machines. Your task is to process the provided image and settings, and return a valid SVG string inside the 'svgString' field of a JSON object.

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** The output MUST be a JSON object with a single key "svgString". The value of this key must be a valid SVG string. Do NOT add any text, explanations, or markdown formatting around the JSON object.
2.  **Laser Cutting Optimized:** The SVG must be simple. Use only monochrome fills (black, #000000) and no stroke. No gradients, filters, or complex effects. The goal is a clean outline or silhouette.
3.  **ViewBox:** The generated SVG must have a viewBox attribute that matches the aspect ratio of the input image. For example, 'viewBox="0 0 400 400"'.
4.  **Single Path:** When 'singlePath' is true, combine all elements into a single compound path if possible.
5.  **Background Removal:** When 'removeBackground' is true, isolate the main subject and discard the background completely.
6.  **Adhere to Settings:** Use the 'detailLevel' and 'smoothness' parameters to guide the vectorization process.

**Image to vectorize:**
{{media url=imageDataUri}}

**Vectorization Settings:**
- Detail Level: {{detailLevel}} (0=Less detail, 100=More detail)
- Curve Smoothing: {{smoothness}} (0=Very angular, 100=Very smooth)
- Remove Background: {{#if removeBackground}}Yes{{else}}No{{/if}}
- Create Single Path: {{#if singlePath}}Yes{{else}}No{{/if}}
`,
});

const vectorizeImageFlow = ai.defineFlow(
  {
    name: 'vectorizeImageFlow',
    inputSchema: VectorizeImageInputSchema,
    outputSchema: VectorizeImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output?.svgString) {
      throw new Error('The AI failed to generate an SVG string.');
    }

    return { svgString: output.svgString };
  }
);
