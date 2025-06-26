'use server';

/**
 * @fileOverview Classifies identified opportunities based on investment level and potential ROI.
 *
 * - classifyOpportunity - A function that classifies an opportunity.
 * - ClassifyOpportunityInput - The input type for the classifyOpportunity function.
 * - ClassifyOpportunityOutput - The return type for the classifyOpportunity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyOpportunityInputSchema = z.object({
  title: z.string().describe('The title of the opportunity.'),
  description: z.string().describe('A detailed description of the opportunity.'),
  platform: z.string().describe('The platform where the opportunity is available (e.g., Mercado Libre, Amazon MX).'),
  expirationDate: z.string().describe('The expiration date of the opportunity.'),
  estimatedMargin: z.string().describe('The estimated profit margin or potential savings.'),
  investmentLevel: z.string().describe('The level of investment required (e.g., Free, Minimal Investment).'),
  roiPotential: z.string().describe('The potential return on investment (e.g., High ROI, Medium ROI, Low ROI).'),
});
export type ClassifyOpportunityInput = z.infer<typeof ClassifyOpportunityInputSchema>;

const ClassifyOpportunityOutputSchema = z.object({
  priorityScore: z.number().describe('A score indicating the priority of the opportunity (higher is better).'),
  monetizationStrategy: z.string().describe('A suggested strategy for monetizing the opportunity (e.g., resell, redeem, accumulate value).'),
  riskAssessment: z.string().describe('An assessment of the risk associated with the opportunity (e.g., low, medium, high).'),
});
export type ClassifyOpportunityOutput = z.infer<typeof ClassifyOpportunityOutputSchema>;

export async function classifyOpportunity(input: ClassifyOpportunityInput): Promise<ClassifyOpportunityOutput> {
  return classifyOpportunityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyOpportunityPrompt',
  input: {schema: ClassifyOpportunityInputSchema},
  output: {schema: ClassifyOpportunityOutputSchema},
  prompt: `You are an expert in evaluating business opportunities and providing actionable insights.

  Given the following information about a potential opportunity, classify it based on its priority, suggest a monetization strategy, and assess the risk.

  Title: {{{title}}}
  Description: {{{description}}}
  Platform: {{{platform}}}
  Expiration Date: {{{expirationDate}}}
  Estimated Margin: {{{estimatedMargin}}}
  Investment Level: {{{investmentLevel}}}
  ROI Potential: {{{roiPotential}}}

  Consider the investment level and ROI potential to determine the priority score. Opportunities with lower investment and higher ROI should have higher scores.

  Provide a monetization strategy tailored to the specifics of the opportunity. Suggest how the user can best leverage it for profit or savings.

  Assess the risk associated with the opportunity based on the provided details. Factors to consider include the platform's reliability, the clarity of the offer, and the time sensitivity.
`,
});

const classifyOpportunityFlow = ai.defineFlow(
  {
    name: 'classifyOpportunityFlow',
    inputSchema: ClassifyOpportunityInputSchema,
    outputSchema: ClassifyOpportunityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
