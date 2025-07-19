'use server';
/**
 * @fileOverview Genkit tools for event booking: checking date availability and initiating bookings.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { checkAvailability as serviceCheckAvailability, createBooking as serviceCreateBooking, getBeveragePackages as serviceGetPackages } from '@/services/eventService';
import type { BookingRequest, BeveragePackage } from '@/types';

// Schema for checkDateAvailability tool
const CheckDateAvailabilityInputSchema = z.object({
  eventDate: z.string().describe("La fecha del evento que el usuario quiere verificar, en formato AAAA-MM-DD."),
});
const CheckDateAvailabilityOutputSchema = z.object({
  available: z.boolean().describe("Indica si la fecha está disponible."),
  message: z.string().describe("Un mensaje para el usuario sobre la disponibilidad de la fecha."),
});

export const checkDateAvailabilityTool = ai.defineTool(
  {
    name: 'checkDateAvailability',
    description: 'Verifica si una fecha específica está disponible para un evento. Siempre debes proporcionar la fecha en formato AAAA-MM-DD.',
    inputSchema: CheckDateAvailabilityInputSchema,
    outputSchema: CheckDateAvailabilityOutputSchema,
  },
  async (input) => {
    return serviceCheckAvailability(input.eventDate);
  }
);

// Schema for initiateBooking tool
const InitiateBookingInputSchema = z.object({
  clientName: z.string().describe("Nombre completo del cliente."),
  clientEmail: z.string().describe("Correo electrónico del cliente."),
  clientPhone: z.string().describe("Número de teléfono del cliente."),
  eventType: z.string().describe("Tipo de evento (ej. Boda, Cumpleaños, Corporativo)."),
  eventDate: z.string().describe("Fecha del evento en formato AAAA-MM-DD. Debe ser una fecha previamente confirmada como disponible."),
  guestCount: z.number().int().positive().describe("Número estimado de invitados."),
  packageName: z.string().optional().describe("Nombre del paquete de bebidas seleccionado por el cliente o recomendado por el asistente. Ej: 'Paquete Esencial', 'Paquete Clásico', 'Paquete Premium'"),
});
export type InitiateBookingInput = z.infer<typeof InitiateBookingInputSchema>;

const InitiateBookingOutputSchema = z.object({
  bookingId: z.string().describe("El ID único de la pre-reserva."),
  status: z.string().describe("El estado de la reserva (ej. 'pending_deposit')."),
  totalCost: z.number().describe("El costo total estimado del servicio."),
  depositAmount: z.number().describe("El monto del anticipo requerido (30% del total)."),
  confirmationMessage: z.string().describe("Mensaje de confirmación para el usuario, incluyendo detalles y próximos pasos."),
});

export const initiateBookingTool = ai.defineTool(
  {
    name: 'initiateBooking',
    description: 'Inicia el proceso de reserva para un evento una vez que todos los detalles necesarios han sido recopilados y la fecha ha sido confirmada como disponible. Calcula el costo total y el depósito del 30%.',
    inputSchema: InitiateBookingInputSchema,
    outputSchema: InitiateBookingOutputSchema,
  },
  async (input: InitiateBookingInput) => {
    const packages = await serviceGetPackages();
    const selectedPkg = packages.find(p => p.name.toLowerCase() === input.packageName?.toLowerCase());

    const bookingDetails: BookingRequest = {
      ...input,
      packageId: selectedPkg?.id,
    };
    return serviceCreateBooking(bookingDetails);
  }
);

// Schema for getPackages tool
const GetPackagesOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
  })
).describe("Lista de paquetes de bebidas disponibles con sus detalles y precios.");

export const getBeveragePackagesTool = ai.defineTool(
    {
        name: 'getBeveragePackages',
        description: 'Obtiene la lista de paquetes de bebidas disponibles, incluyendo nombre, descripción y precio de cada uno.',
        inputSchema: z.object({}), // No input needed
        outputSchema: GetPackagesOutputSchema,
    },
    async () => {
        return serviceGetPackages();
    }
);

// The 'tools' array is no longer exported from here.
// It will be constructed in the flow that uses these tools.
