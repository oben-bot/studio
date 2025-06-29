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
const AgentFlowInputSchema = z.object({
  prompt: z.string().describe("The user's message from the chat."),
  detailLevel: z.number().min(0).max(100),
  smoothness: z.number().min(0).max(100),
  removeBackground: z.boolean(),
  singlePath: z.boolean(),
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
  return agentFlow(input);
}

// Tool definition for creating a vector image
const createVectorImageTool = ai.defineTool(
  {
    name: 'createVectorImage',
    description: "Creates a vector image (SVG) from a user's text description. Use this tool whenever the user asks to generate, create, design, or draw a logo, silhouette, icon, vector, or any other graphic.",
    inputSchema: AgentFlowInputSchema.pick({ prompt: true, detailLevel: true, smoothness: true, removeBackground: true, singlePath: true }),
    outputSchema: z.string().describe('The raw SVG string of the vectorized image.'),
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
    
    // The tool's job is to return the raw SVG string.
    return vectorizationResult.svgString;
  }
);

// The main agent prompt that decides whether to chat or use the tool
const agentPrompt = ai.definePrompt({
  name: 'laserAiAgentPrompt',
  tools: [createVectorImageTool],
  input: { schema: AgentFlowInputSchema },
  // Let the model decide whether to return text or a tool call.
  system: `You are OBN Kodex LaserAI, a friendly and helpful assistant for laser cutting and engraving designs.
- If the user asks you to create, draw, or generate a design, logo, icon, or any visual, you MUST use the \`createVectorImage\` tool.
- After the tool runs successfully, provide a brief confirmation message in Spanish, like "¡Claro! Aquí está tu diseño."
- If the user is just asking a question or having a conversation, provide a helpful, concise answer in Spanish.
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
    const response = await agentPrompt(input);
    let svgString: string | undefined;

    // Look for a tool response in the history.
    if (response.history) {
      for (const message of response.history.slice().reverse()) {
        for (const part of message.content) {
          if (part.toolResponse) {
            // The tool's outputSchema is z.string(), so the content is a string.
            svgString = part.toolResponse.content as string;
            break; // Found the tool response, no need to look further
          }
        }
        if (svgString) break;
      }
    }

    const textResponse = response.text;

    if (!svgString && !textResponse) {
        throw new Error('The AI agent returned an empty or unexpected response.');
    }

    return {
        svgString,
        textResponse,
    };
  }
);
