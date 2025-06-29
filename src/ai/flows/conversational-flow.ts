'use server';
/**
 * @fileOverview An intelligent agent that can chat with the user and create vector images.
 *
 * - runAgent - The main flow that processes user input.
 * - AgentFlowInput - The input type for the runAgent function.
 * - AgentFlowOutput - The return type for the runAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { vectorizeImage, VectorizeImageInput } from './vectorize-image-flow';

// Input schema for the main agent flow
export const AgentFlowInputSchema = z.object({
  prompt: z.string().describe("The user's message from the chat."),
  detailLevel: z.number().min(0).max(100),
  smoothness: z.number().min(0).max(100),
  removeBackground: z.boolean(),
  singlePath: z.boolean(),
});
export type AgentFlowInput = z.infer<typeof AgentFlowInputSchema>;

// Output schema for the main agent flow
export const AgentFlowOutputSchema = z.object({
  textResponse: z.string().optional().describe('A text-based response to the user.'),
  svgString: z.string().optional().describe('The vectorized image as a valid, well-formed SVG string, if one was generated.'),
});
export type AgentFlowOutput = z.infer<typeof AgentFlowOutputSchema>;

// Wrapper function to be called from the UI
export async function runAgent(input: AgentFlowInput): Promise<AgentFlowOutput> {
  return agentFlow(input);
}

// Tool definition for creating a vector image
const createVectorImageTool = ai.defineTool(
  {
    name: 'createVectorImage',
    description: "Creates a vector image (SVG) from a user's text description. Use this tool whenever the user asks to generate, create, design, or draw a logo, silhouette, icon, vector, or any other graphic.",
    inputSchema: AgentFlowInputSchema.pick({ prompt: true, detailLevel: true, smoothness: true, removeBackground: true, singlePath: true }),
    outputSchema: z.string().describe('The vectorized image as a valid, well-formed SVG string.'),
  },
  async (input) => {
    // Step 1: Generate a raster image from the text prompt.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a clean, high-contrast, black-on-white line art image suitable for vectorization and laser cutting, based on the following description: "${input.prompt}". The image should look like a silhouette or a stencil, with only pure black and pure white pixels. The main subject should be clearly defined against a plain white background.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate an image from the prompt.');
    }

    // Step 2: Vectorize the generated raster image.
    const vectorizeInput: VectorizeImageInput = {
        imageDataUri: media.url,
        detailLevel: input.detailLevel,
        smoothness: input.smoothness,
        removeBackground: input.removeBackground,
        singlePath: input.singlePath,
    };

    const vectorizationResult = await vectorizeImage(vectorizeInput);

    if (!vectorizationResult.svgString) {
      throw new Error('Failed to vectorize the generated image.');
    }
    
    return vectorizationResult.svgString;
  }
);

// The main agent prompt that decides whether to chat or use the tool
const agentPrompt = ai.definePrompt({
  name: 'laserAiAgentPrompt',
  tools: [createVectorImageTool],
  input: { schema: AgentFlowInputSchema },
  output: { schema: AgentFlowOutputSchema },
  system: `You are OBN Kodex LaserAI, a friendly and helpful assistant for laser cutting and engraving designs.
Your primary function is to help users create vector images (SVGs).

- If the user asks you to create, draw, or generate a design, logo, icon, or any visual, you MUST use the \`createVectorImage\` tool. Pass the user's description as the 'prompt' parameter and include the other settings.
- After the tool runs and you receive the SVG string as a result, your final response MUST be a JSON object with the \`svgString\` field populated with that result.
- If the user asks a general question (e.g., "hello", "how are you?", "what can you do?"), your final response must be a JSON object with the 'textResponse' field populated with your helpful, concise answer.
- If the tool fails, provide a helpful error message in the 'textResponse' field.
- Keep your text responses short, friendly, and in Spanish.
`
});


// The main agent flow
const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentFlowInputSchema,
    outputSchema: AgentFlowOutputSchema,
  },
  async (input) => {
    const { output } = await agentPrompt(input);

    if (!output) {
      throw new Error('The AI agent returned an empty response.');
    }
    
    // The prompt guides the model to return the correct schema, so we just return its output.
    return output;
  }
);
