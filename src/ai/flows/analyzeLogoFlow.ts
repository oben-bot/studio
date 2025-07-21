
'use server';
/**
 * @fileOverview A flow to analyze a logo image and extract dominant colors.
 *
 * - analyzeLogoFlow - Takes a logo image and returns a list of dominant hex colors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeLogoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A logo image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const AnalyzeLogoOutputSchema = z.object({
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/))
    .max(6)
    .describe('A list of up to 6 dominant hexadecimal color codes from the logo.'),
});

export type AnalyzeLogoInput = z.infer<typeof AnalyzeLogoInputSchema>;
export type AnalyzeLogoOutput = z.infer<typeof AnalyzeLogoOutputSchema>;

export async function analyzeLogoFlow(
  input: AnalyzeLogoInput
): Promise<AnalyzeLogoOutput> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: [
        { text: 'Analyze the provided logo image. Identify and extract up to 6 of the most dominant colors present in the logo. Return these colors as a JSON array of hexadecimal color codes. For example: {"colors": ["#FFFFFF", "#000000"]}' },
        { media: { url: input.photoDataUri } },
    ],
    output: {
      format: 'json',
      schema: AnalyzeLogoOutputSchema,
    },
    config: {
      temperature: 0.1,
    },
  });

  return llmResponse.output || { colors: [] };
}
