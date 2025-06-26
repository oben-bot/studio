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
  estimatedMargin: z.string().optional().describe('The estimated profit margin or savings associated with the opportunity.'),
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
  prompt: `You are an expert in identifying opportunities for users from e-commerce data. Your primary goal is to extract ALL available opportunities from the user's input.

  Analyze the following e-commerce data. The data may contain information from multiple e-commerce platforms or stores. You must identify every single potential opportunity, such as coupons, special offers, or pricing errors. Do not stop after finding the first one.

  For EACH opportunity found, create an object with the following fields: title, platform, expiry, estimatedMargin, action, and details.
  - The 'platform' field must accurately reflect the name of the store or website where the opportunity is found (e.g., Liverpool, Coppel, Amazon MX, etc.).
  - The 'estimatedMargin' field is optional. Only include it if you can confidently estimate a margin.

  Return a complete list containing ALL the opportunities you have identified. The output MUST be a JSON array of objects, even if only one opportunity is found.

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
