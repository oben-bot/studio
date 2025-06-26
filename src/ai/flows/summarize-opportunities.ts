// SummarizeOpportunities.ts
'use server';

/**
 * @fileOverview Summarizes the key details of a potential opportunity.
 *
 * - summarizeOpportunity - A function that summarizes the key details of a potential opportunity.
 * - SummarizeOpportunityInput - The input type for the summarizeOpportunity function.
 * - SummarizeOpportunityOutput - The return type for the summarizeOpportunity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeOpportunityInputSchema = z.object({
  title: z.string().describe('The title of the opportunity.'),
  platform: z.string().describe('The platform where the opportunity is available (e.g., Mercado Libre, Amazon MX).'),
  expiration: z.string().describe('The expiration date and time of the opportunity.'),
  estimatedMargin: z.string().describe('The estimated profit margin of the opportunity.'),
  recommendedAction: z.string().describe('The recommended action to take for the opportunity (e.g., resell, redeem).'),
});
export type SummarizeOpportunityInput = z.infer<typeof SummarizeOpportunityInputSchema>;

const SummarizeOpportunityOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the opportunity, including key details.'),
});
export type SummarizeOpportunityOutput = z.infer<typeof SummarizeOpportunityOutputSchema>;

export async function summarizeOpportunity(input: SummarizeOpportunityInput): Promise<SummarizeOpportunityOutput> {
  return summarizeOpportunityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOpportunityPrompt',
  input: {schema: SummarizeOpportunityInputSchema},
  output: {schema: SummarizeOpportunityOutputSchema},
  prompt: `Summarize the following opportunity in a concise manner, highlighting the key details such as title, platform, expiration, estimated margin, and recommended action.\n\nTitle: {{{title}}}\nPlatform: {{{platform}}}\nExpiration: {{{expiration}}}\nEstimated Margin: {{{estimatedMargin}}}\nRecommended Action: {{{recommendedAction}}}`,
});

const summarizeOpportunityFlow = ai.defineFlow(
  {
    name: 'summarizeOpportunityFlow',
    inputSchema: SummarizeOpportunityInputSchema,
    outputSchema: SummarizeOpportunityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
