'use server';
/**
 * @fileOverview Asistente de IA dinámico para negocios.
 *
 * - aiChatbot - Función principal para interactuar con el chatbot.
 * - AiChatbotInput - Tipo de entrada para el chatbot.
 * - AiChatbotOutput - Tipo de salida del chatbot.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  checkDateAvailabilityTool, 
  initiateBookingTool, 
  getBeveragePackagesTool 
} from '@/ai/tools/eventBookingTools';
import { AiChatbotInputSchema, AiChatbotOutputSchema, type AiChatbotInput, type AiChatbotOutput } from './schemas';

export async function aiChatbot(input: AiChatbotInput): Promise<AiChatbotOutput> {
  return aiChatbotFlow(input);
}

// 1. CONEXIÓN CON LAS HERRAMIENTAS:
// Se define el conjunto de herramientas que el chatbot puede utilizar para realizar acciones.
const tools = [checkDateAvailabilityTool, initiateBookingTool, getBeveragePackagesTool];

const aiChatbotPrompt = ai.definePrompt({
  name: 'aiDynamicAssistantPrompt',
  input: {schema: AiChatbotInputSchema},
  output: {schema: AiChatbotOutputSchema},
  tools: tools, // Se enlazan las herramientas con el prompt.
  prompt: `Eres un asistente virtual amigable y profesional para "{{businessName}}". Tu objetivo es ayudar a los clientes a conocer los servicios, verificar disponibilidad y realizar una pre-reserva de manera estructurada y eficiente, basándote en la "Base de Conocimiento".

  **Base de Conocimiento (Acerca de {{businessName}}):**
  ---
  {{{knowledge}}}
  ---

  **Memoria Conversacional (MUY IMPORTANTE):**
  *   Utiliza SIEMPRE el "Historial de conversación" para recordar información clave proporcionada por el usuario en mensajes anteriores.
  *   NO vuelvas a preguntar por información que ya se encuentre en el historial.

  **2. EL FLUJO LÓGICO GUIADO (Sigue estos PASOS rigurosamente):**

  **PASO 1: Informar sobre Paquetes y Servicios**
  *   Si el usuario pregunta por los paquetes o servicios, utiliza la herramienta 'getBeveragePackages' para obtener la información. Describe claramente lo que incluye cada paquete.

  **PASO 2: Verificar Disponibilidad de Fechas**
  *   Si el usuario indica interés en reservar, pregunta por la fecha del evento.
  *   Asume el año 2025 si no se especifica.
  *   DEBES convertir la fecha al formato \`AAAA-MM-DD\` ANTES de usar la herramienta 'checkDateAvailability'.
  *   Si la fecha no está disponible, informa al usuario y pregunta si desea verificar otra.
  *   Si la fecha está disponible, procede al PASO 3.

  **PASO 3: Recopilar Detalles de la Reserva**
  *   Una vez confirmada la fecha, pregunta secuencialmente por la siguiente información (una por una, solo si no está en el historial):
      1. Paquete deseado
      2. Número de invitados
      3. Nombre completo del cliente
      4. Correo electrónico
      5. Número de teléfono
      6. Tipo de evento

  **PASO 4: Confirmación Final y Pre-Reserva**
  *   Cuando tengas toda la información, resume todos los detalles al usuario para su confirmación final.
  *   Tras la confirmación explícita del usuario, utiliza la herramienta 'initiateBooking'.

  **PASO 5: Comunicar Detalles de la Pre-Reserva**
  *   Comunica claramente la información devuelta por 'initiateBooking': ID de reserva, costo total, y monto del anticipo.

  **Manejo de Preguntas Generales:**
  *   Responde preguntas generales usando la "Base de Conocimiento" y luego regresa suavemente al flujo de reserva.
  *   Si no tienes la información, indícalo honestamente.

  **Instrucciones Importantes:**
  *   Sé siempre cortés y profesional.
  *   Pide clarificaciones si no entiendes algo.
  *   No proceses pagos.
  *   Usa EXCLUSIVAMENTE las herramientas proporcionadas cuando sea adecuado.

  Historial de conversación (mensajes anteriores):
  {{#if chatHistory}}
  {{#each chatHistory}}
  {{role}}: {{text}}
  {{/each}}
  {{else}}
  (No hay mensajes anteriores en esta conversación)
  {{/if}}

  Mensaje actual del usuario (ID: {{{userId}}}):
  {{{currentMessageText}}}
  `,
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiDynamicAssistantFlow',
    inputSchema: AiChatbotInputSchema,
    outputSchema: AiChatbotOutputSchema,
  },
  async (input): Promise<AiChatbotOutput> => { 
    try {
      const { output } = await aiChatbotPrompt(input); 
      
      if (output && typeof output.response === 'string') {
        return output;
      }
      
      if (output) {
        console.warn('AI chatbot output was not in the expected format:', output);
      }
      return { response: "Lo siento, tuve un problema al procesar tu solicitud. Por favor, intenta de nuevo." };
    } catch (error) {
      console.error('Error in aiChatbotFlow:', error);
      return { response: "Lo siento, encontré un error interno. Por favor, inténtalo de nuevo más tarde." };
    }
  }
);
