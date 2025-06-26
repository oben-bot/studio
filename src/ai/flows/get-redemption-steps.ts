'use server';
/**
 * @fileOverview Provides step-by-step instructions on how to redeem a promotion.
 *
 * - getRedemptionSteps - A function that returns a list of steps to redeem an opportunity.
 * - GetRedemptionStepsInput - The input type for the getRedemptionSteps function.
 * - GetRedemptionStepsOutput - The return type for the getRedemptionSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRedemptionStepsInputSchema = z.object({
  title: z.string().describe('The title of the opportunity.'),
  platform: z.string().describe('The platform where the opportunity is available (e.g., Mercado Libre, Amazon MX).'),
  details: z.string().describe('A detailed description of the opportunity.'),
});
export type GetRedemptionStepsInput = z.infer<typeof GetRedemptionStepsInputSchema>;

const GetRedemptionStepsOutputSchema = z.object({
  steps: z.array(z.string()).describe('A list of clear, actionable steps to redeem the promotion.'),
});
export type GetRedemptionStepsOutput = z.infer<typeof GetRedemptionStepsOutputSchema>;

export async function getRedemptionSteps(input: GetRedemptionStepsInput): Promise<GetRedemptionStepsOutput> {
  return getRedemptionStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRedemptionStepsPrompt',
  input: {schema: GetRedemptionStepsInputSchema},
  output: {schema: GetRedemptionStepsOutputSchema},
  prompt: `You are a helpful assistant that provides clear, step-by-step instructions on how to take advantage of an e-commerce promotion.
Your language is Spanish.

Given the following information about an opportunity, generate a numbered list of steps for the user to follow to redeem it.
Be specific and clear. If a coupon code is needed but not provided in the details, instruct the user to find it. If the instructions seem ambiguous, mention that.

Title: {{{title}}}
Platform: {{{platform}}}
Details: {{{details}}}

Provide the response as a list of steps.
`,
});

const getRedemptionStepsFlow = ai.defineFlow(
  {
    name: 'getRedemptionStepsFlow',
    inputSchema: GetRedemptionStepsInputSchema,
    outputSchema: GetRedemptionStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
