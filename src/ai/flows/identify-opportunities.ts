// This file uses server-side code.
'use server';

/**
 * @fileOverview Identifies potential opportunities from e-commerce data using GenAI.
 *
 * - identifyOpportunities - A function that identifies opportunities from e-commerce data.
 * - IdentifyOpportunitiesInput - The input type for the identifyOpportunities function.
 * - IdentifyOpportunitiesOutput - The return type for the identifyOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyOpportunitiesInputSchema = z.object({
  ecommerceData: z.string().describe('Data scraped from various e-commerce sites.'),
});
export type IdentifyOpportunitiesInput = z.infer<typeof IdentifyOpportunitiesInputSchema>;

const OpportunitySchema = z.object({
  title: z.string().describe('The title of the opportunity.'),
  platform: z.string().describe('The e-commerce platform or store where the opportunity exists (e.g., Liverpool, Coppel, Amazon MX).'),
  expiry: z.string().optional().describe('The expiration date and time of the opportunity, if applicable.'),
  estimatedMargin: z.string().describe('The estimated profit margin or savings associated with the opportunity.'),
  action: z.string().describe('Recommended action to take (e.g., purchase, redeem coupon).'),
  details: z.string().describe('Additional relevant details about the opportunity.'),
});

const IdentifyOpportunitiesOutputSchema = z.array(OpportunitySchema).describe('A list of identified opportunities.');
export type IdentifyOpportunitiesOutput = z.infer<typeof IdentifyOpportunitiesOutputSchema>;

export async function identifyOpportunities(input: IdentifyOpportunitiesInput): Promise<IdentifyOpportunitiesOutput> {
  return identifyOpportunitiesFlow(input);
}

const identifyOpportunitiesPrompt = ai.definePrompt({
  name: 'identifyOpportunitiesPrompt',
  input: {schema: IdentifyOpportunitiesInputSchema},
  output: {schema: IdentifyOpportunitiesOutputSchema},
  prompt: `You are an expert in identifying opportunities for users from e-commerce data.

  Analyze the following e-commerce data and identify potential opportunities, such as coupons, special offers, or pricing errors. It is very important that you extract opportunities from **any and all** e-commerce platforms mentioned in the data, not just common ones.

  For each opportunity found, return a list of opportunities including title, platform, expiry, estimatedMargin, action and details. The 'platform' field should accurately reflect the name of the store or website where the opportunity is found.

  E-commerce Data: {{{ecommerceData}}}
  `,
});

const identifyOpportunitiesFlow = ai.defineFlow(
  {
    name: 'identifyOpportunitiesFlow',
    inputSchema: IdentifyOpportunitiesInputSchema,
    outputSchema: IdentifyOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await identifyOpportunitiesPrompt(input);
    return output!;
  }
);
