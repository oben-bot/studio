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
  model: 'googleai/gemini-2.5-pro',
  input: {schema: VectorizeImageInputSchema},
  output: {schema: VectorizeImageOutputSchema},
  prompt: `You are a highly specialized AI engine that converts raster images into SVG code optimized for laser cutters. Your ONLY function is to output a JSON object containing a valid SVG string.

**ABSOLUTE RULES:**
1.  **JSON ONLY:** Your entire response MUST be a raw JSON object. NO markdown, NO explanations, NO text before or after the JSON.
2.  **SVG CONTENT:**
    *   The SVG MUST be monochrome (fill="#000000").
    *   It MUST NOT have a stroke (\`stroke="none"\`).
    *   It MUST be a single \`<path>\` element if 'singlePath' is true.
    *   It MUST have a \`viewBox\` attribute.
    *   The path data (\`d="..."\`) must be valid.
3.  **NO INVALID OUTPUT:** Do not output text, invalid SVG, or anything other than the specified JSON format.

**EXAMPLE OUTPUT:**
{
  "svgString": "<svg viewBox=\\"0 0 100 100\\" xmlns=\\"http://www.w3.org/2000/svg\\"><path fill=\\"#000000\\" stroke=\\"none\\" d=\\"M10 10 H 90 V 90 H 10 Z\\"/></svg>"
}

Now, process the following image based on the user's settings.

**Image to vectorize:**
{{media url=imageDataUri}}

**Settings:**
- Detail Level: {{detailLevel}}
- Curve Smoothing: {{smoothness}}
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

    // Basic validation to prevent rendering garbage
    if (!output.svgString.trim().startsWith('<svg')) {
      console.error("Invalid SVG received from AI:", output.svgString);
      throw new Error('The AI returned an invalid SVG format.');
    }

    return { svgString: output.svgString };
  }
);
