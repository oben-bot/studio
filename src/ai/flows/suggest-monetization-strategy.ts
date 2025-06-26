'use server';
/**
 * @fileOverview Suggests a monetization strategy for a given opportunity.
 *
 * - suggestMonetizationStrategy - A function that suggests a monetization strategy.
 * - SuggestMonetizationStrategyInput - The input type for the suggestMonetizationStrategy function.
 * - SuggestMonetizationStrategyOutput - The return type for the suggestMonetizationStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMonetizationStrategyInputSchema = z.object({
  opportunityTitle: z.string().describe('The title of the opportunity.'),
  opportunityPlatform: z.string().describe('The platform where the opportunity exists (e.g., Mercado Libre, Amazon MX).'),
  opportunityDescription: z.string().describe('A detailed description of the opportunity, including price, discount, and expiration date.'),
});
export type SuggestMonetizationStrategyInput = z.infer<typeof SuggestMonetizationStrategyInputSchema>;

const SuggestMonetizationStrategyOutputSchema = z.object({
  monetizationStrategy: z.string().describe('A suggested strategy for monetizing the opportunity (e.g., resell, redeem, accumulate value).'),
  reasoning: z.string().describe('The reasoning behind the suggested monetization strategy.'),
});
export type SuggestMonetizationStrategyOutput = z.infer<typeof SuggestMonetizationStrategyOutputSchema>;

export async function suggestMonetizationStrategy(input: SuggestMonetizationStrategyInput): Promise<SuggestMonetizationStrategyOutput> {
  return suggestMonetizationStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMonetizationStrategyPrompt',
  input: {schema: SuggestMonetizationStrategyInputSchema},
  output: {schema: SuggestMonetizationStrategyOutputSchema},
  prompt: `You are an expert in identifying and suggesting monetization strategies for various opportunities found on e-commerce platforms.

  Given the details of an opportunity, analyze the information and suggest the best way to monetize it.
  Consider strategies such as reselling the product, redeeming a coupon, or accumulating value through discounts.

  Opportunity Title: {{{opportunityTitle}}}
  Platform: {{{opportunityPlatform}}}
  Description: {{{opportunityDescription}}}

  Suggest a monetization strategy and provide a clear reasoning for your suggestion.
  Your response should be concise and actionable.
  `,
});

const suggestMonetizationStrategyFlow = ai.defineFlow(
  {
    name: 'suggestMonetizationStrategyFlow',
    inputSchema: SuggestMonetizationStrategyInputSchema,
    outputSchema: SuggestMonetizationStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

