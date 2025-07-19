'use server';
/**
 * @fileOverview Mock service for event booking functionalities.
 * This service simulates database interactions for an event booking system.
 */
import type { BookingRequest, BookingResponse, BeveragePackage } from '@/types';

// Mock database of unavailable dates
const unavailableDates = new Set([
  '2025-08-15',
  '2025-09-01',
  '2025-10-31',
  '2025-12-24',
  '2025-12-25',
]);

// Mock database of available beverage packages
const beveragePackages: BeveragePackage[] = [
    { id: 'pkg_1', name: 'Paquete Esencial', description: 'Incluye 3 bebidas a elegir para 50 personas.', price: 4500 },
    { id: 'pkg_2', name: 'Paquete Clásico', description: 'Barra de Mojitos especializada con 1 ronda (25 bebidas).', price: 1500 },
    { id: 'pkg_3', name: 'Paquete Premium', description: 'Barra de Mojitos especializada con 2 rondas (50 bebidas).', price: 2800 },
    { id: 'pkg_4', name: 'Vitroleros', description: 'Venta individual de vitroleros, nuestra opción más económica.', price: 500 },
];

/**
 * Checks if a given date is available for booking.
 * @param eventDate - The date to check, in 'YYYY-MM-DD' format.
 * @returns An object indicating availability and a message.
 */
export async function checkAvailability(eventDate: string): Promise<{ available: boolean; message: string }> {
  console.log(`Checking availability for: ${eventDate}`);
  if (unavailableDates.has(eventDate)) {
    return {
      available: false,
      message: `Lo siento, la fecha ${eventDate} no está disponible. ¿Te gustaría verificar otra?`,
    };
  }
  return {
    available: true,
    message: `¡Buenas noticias! La fecha ${eventDate} está disponible para tu evento.`,
  };
}

/**
 * Creates a new booking in the system.
 * @param bookingDetails - The details of the booking request.
 * @returns The confirmed booking details, including a booking ID and cost.
 */
export async function createBooking(bookingDetails: BookingRequest): Promise<BookingResponse> {
  console.log('Creating booking with details:', bookingDetails);
  
  const selectedPkg = beveragePackages.find(p => p.id === bookingDetails.packageId || p.name === bookingDetails.packageName);

  if (!selectedPkg) {
    throw new Error('Package not found');
  }

  const totalCost = selectedPkg.price;
  const depositAmount = totalCost * 0.30; // 30% deposit

  const bookingId = `BK-${Date.now()}`;

  const response: BookingResponse = {
    bookingId,
    status: 'pending_deposit',
    totalCost,
    depositAmount,
    confirmationMessage: `¡Excelente! Hemos creado tu pre-reserva con el ID ${bookingId}. El costo total es de $${totalCost.toFixed(2)} y se requiere un anticipo de $${depositAmount.toFixed(2)}. Nos pondremos en contacto contigo para confirmar el pago y los detalles finales.`,
  };

  // Here you would typically save the booking to a database
  // e.g., db.collection('bookings').add({ ...bookingDetails, ...response });

  return response;
}

/**
 * Retrieves the list of available beverage packages.
 * @returns An array of beverage packages.
 */
export async function getBeveragePackages(): Promise<BeveragePackage[]> {
    console.log('Fetching beverage packages.');
    return beveragePackages;
}
