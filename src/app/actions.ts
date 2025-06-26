
'use server';

import { identifyOpportunities as identifyOpportunitiesFlow, IdentifyOpportunitiesOutput as IdentifyOpportunitiesOutputInternal } from '@/ai/flows/identify-opportunities';
import { classifyOpportunity as classifyOpportunityFlow } from '@/ai/flows/classify-opportunities';
import { suggestMonetizationStrategy as suggestMonetizationStrategyFlow } from '@/ai/flows/suggest-monetization-strategy';
import { getRedemptionSteps as getRedemptionStepsFlow } from '@/ai/flows/get-redemption-steps';
import { z } from 'zod';

export type { IdentifyOpportunitiesOutput, IdentifyOpportunitiesInput } from '@/ai/flows/identify-opportunities';
export type { ClassifyOpportunityOutput, ClassifyOpportunityInput } from '@/ai/flows/classify-opportunities';
export type { SuggestMonetizationStrategyOutput, SuggestMonetizationStrategyInput } from '@/ai/flows/suggest-monetization-strategy';
export type { GetRedemptionStepsOutput, GetRedemptionStepsInput } from '@/ai/flows/get-redemption-steps';
export type Opportunity = IdentifyOpportunitiesOutputInternal[0];

const identifySchema = z.object({
  ecommerceData: z.string().min(20, "Por favor, proporcione más datos para analizar."),
});

type IdentifyState = {
  opportunities?: Opportunity[];
  error?: string | null;
}

export async function identifyOpportunities(prevState: IdentifyState, formData: FormData): Promise<IdentifyState> {
  const validatedFields = identifySchema.safeParse({
    ecommerceData: formData.get('ecommerceData'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.ecommerceData?.join(", "),
    };
  }

  try {
    const opportunities = await identifyOpportunitiesFlow({ ecommerceData: validatedFields.data.ecommerceData });
    if (!opportunities || opportunities.length === 0) {
        return { error: 'No se encontraron oportunidades claras. Intente con datos diferentes o más detallados.' };
    }
    return { opportunities, error: null };
  } catch (error) {
    console.error("Error in identifyOpportunities action:", error);
    return { error: 'Error al identificar oportunidades. Por favor, inténtelo de nuevo.' };
  }
}

export async function getClassifyAndSuggest(opportunity: Opportunity) {
    // These are derived guesses since the identification flow doesn't provide them.
    // A more robust solution would involve a more advanced identification flow.
    const investmentLevel = opportunity.title.toLowerCase().includes('cupón') || opportunity.title.toLowerCase().includes('gratis') ? 'Gratis' : 'Inversión Mínima';
    const roiPotential = (parseInt(opportunity.estimatedMargin) > 40) ? 'Alto ROI' : 'Medio ROI';

    try {
        const [classification, suggestion] = await Promise.all([
            classifyOpportunityFlow({
                title: opportunity.title,
                description: opportunity.details,
                platform: opportunity.platform,
                expirationDate: opportunity.expiry || 'No especificada',
                estimatedMargin: opportunity.estimatedMargin,
                investmentLevel,
                roiPotential,
            }),
            suggestMonetizationStrategyFlow({
                opportunityTitle: opportunity.title,
                opportunityPlatform: opportunity.platform,
                opportunityDescription: `Detalles: ${opportunity.details}. Margen estimado: ${opportunity.estimatedMargin}. Expira: ${opportunity.expiry || 'No especificada'}`,
            })
        ]);
        return { classification, suggestion, error: null };
    } catch (error) {
        console.error("Error in getClassifyAndSuggest action:", error);
        return { error: 'No se pudo analizar la oportunidad.', classification: null, suggestion: null };
    }
}

export async function getRedemptionStepsAction(opportunity: Opportunity) {
    try {
        const result = await getRedemptionStepsFlow({
            title: opportunity.title,
            platform: opportunity.platform,
            details: opportunity.details,
        });
        return { steps: result.steps, error: null };
    } catch (error) {
        console.error("Error in getRedemptionStepsAction:", error);
        return { error: 'No se pudieron generar los pasos para canjear la oferta.', steps: null };
    }
}
