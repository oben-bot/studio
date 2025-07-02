
'use server';
/**
 * @fileOverview An intelligent agent that can chat with the user and create vector images.
 * This file uses a robust orchestration pattern to prevent internal AI library errors.
 *
 * - runAgent - The main flow that processes user input, classifies intent, and delegates to other functions.
 * - AgentFlowInput - The input type for the runAgent function.
 * - AgentFlowOutput - The return type for the runAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { vectorizeImage, VectorizeImageInput } from './vectorize-image-flow';

// Input schema for the main agent flow
const AgentFlowInputSchema = z.object({
  prompt: z.string().describe("The user's message from the chat."),
  detailLevel: z.number().min(0).max(100),
  smoothness: z.number().min(0).max(100),
  removeBackground: z.boolean(),
  singlePath: z.boolean(),
  font: z.string().optional().describe('The selected font style for text generation (e.g., sans-serif, gothic, script).'),
});
export type AgentFlowInput = z.infer<typeof AgentFlowInputSchema>;

// Output schema for the main agent flow
const AgentFlowOutputSchema = z.object({
  textResponse: z.string().optional().describe('A text-based response to the user.'),
  svgString: z.string().optional().describe('The vectorized image as a valid, well-formed SVG string, if one was generated.'),
});
export type AgentFlowOutput = z.infer<typeof AgentFlowOutputSchema>;

// Wrapper function to be called from the UI
export async function runAgent(input: AgentFlowInput): Promise<AgentFlowOutput> {
  return agentOrchestrationFlow(input);
}

// A prompt to classify user intent to avoid complex tool-use logic.
const intentClassificationPrompt = ai.definePrompt({
    name: 'intentClassificationPrompt',
    input: { schema: z.object({ prompt: z.string() }) },
    output: { schema: z.object({ intent: z.enum(['generate_design', 'chat', 'unknown']) }) },
    system: `You are an intent classifier for a laser cutting design assistant. Classify the user's prompt into one of the following categories:
- 'generate_design': The user wants to create, generate, draw, make, or design a visual. This includes requests for modifications that imply a new generation (e.g., "now make it a cat", "do a lion instead"). Examples: "dibuja un perro", "logo para mi empresa", "silueta de un arbol".
- 'chat': The user is asking a question, greeting, having a general conversation, or asking to modify an existing design. Examples: "hola", "quien eres?", "puedes hacerlo mas grueso?".`,
    prompt: `User prompt: "{{prompt}}"`
});

// A prompt for general conversation or simple modification responses.
const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: z.object({ prompt: z.string() }) },
    output: { schema: z.object({ response: z.string() }) },
    system: `You are OBN Kodex LaserAI, a friendly and helpful assistant for laser cutting and engraving designs. Provide a concise, helpful, and friendly answer to the user's message in Spanish.`,
    prompt: `User message: "{{prompt}}"`
});


// The main orchestration flow. This is more robust than using AI tool-calling for this task.
const agentOrchestrationFlow = ai.defineFlow(
  {
    name: 'agentOrchestrationFlow',
    inputSchema: AgentFlowInputSchema,
    outputSchema: AgentFlowOutputSchema,
  },
  async (input) => {
    let intent: 'generate_design' | 'chat' | 'unknown';
    try {
      // Step 1: Classify intent of the user's prompt.
      const { output: intentOutput } = await intentClassificationPrompt({ prompt: input.prompt });
      // Default to 'chat' if classification fails for any reason.
      intent = intentOutput?.intent || 'chat';
    } catch (error) {
      console.error("Intent classification failed, defaulting to chat.", error);
      intent = 'chat';
    }

    // Path 1: User wants to generate a new design.
    if (intent === 'generate_design') {
      try {
        // The incoming `input.prompt` is now cleaner and in English.
        // We can construct a more direct prompt for the image generator.
        let generationPrompt: string;
        
        if (input.font) {
          // If a font is provided, it's a text design. The prompt is the text itself.
          generationPrompt = `The text "${input.prompt}" in a high-contrast, artistic ${input.font} font style.`;
        } else {
          // For other designs, use the prompt as a description.
          generationPrompt = input.prompt;
        }

        // Add universal instructions for laser cutting optimization.
        const finalPrompt = `${generationPrompt} The final image must be a clean, black-on-white line art. It should be suitable for vectorization and laser cutting, looking like a silhouette or a stencil with only pure black and pure white pixels on a plain white background.`;

        // Step 2a: Generate a raster image from the text prompt.
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: finalPrompt, // Use the new, cleaner prompt
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (!media || !media.url) {
            return { textResponse: "Lo siento, no pude generar una imagen con esa descripción. ¿Podrías intentar con otra idea?" };
        }

        // Step 2b: Vectorize the generated raster image.
        const vectorizeInput: VectorizeImageInput = {
            imageDataUri: media.url,
            detailLevel: input.detailLevel,
            smoothness: input.smoothness,
            removeBackground: input.removeBackground,
            singlePath: input.singlePath,
        };

        const vectorizationResult = await vectorizeImage(vectorizeInput);

        if (!vectorizationResult.svgString) {
            return { textResponse: "Lo siento, pude generar la imagen pero fallé al vectorizarla. ¿Intentamos de nuevo?" };
        }
        
        // Step 2c: Return the SVG and a canned text response.
        return {
            svgString: vectorizationResult.svgString,
            textResponse: '¡Claro! Aquí está tu diseño. Puedes pedirme ajustes en el chat.',
        };
      } catch (error) {
        console.error("Design generation or vectorization failed:", error);
        return { textResponse: "Lo siento, hubo un problema técnico al generar tu diseño. Esto puede ocurrir si la descripción es muy compleja o si hay un problema temporal. Por favor, intenta con una idea más simple o inténtalo de nuevo más tarde." };
      }

    } else { // Path 2: 'chat' or 'unknown' intent.
      try {
        const { output: chatOutput } = await chatPrompt({ prompt: input.prompt });
        return {
            textResponse: chatOutput?.response || 'No estoy seguro de cómo responder a eso. ¿Puedes reformularlo?',
        };
      } catch (error) {
          console.error("Chat prompt failed:", error);
          return { textResponse: "Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo." };
      }
    }
  }
);
