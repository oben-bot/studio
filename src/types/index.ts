/**
 * @fileOverview Defines the core TypeScript types for the application.
 */

// Represents an available beverage package
export interface BeveragePackage {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Represents a customer's request to create a booking
export interface BookingRequest {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string; // YYYY-MM-DD
  guestCount: number;
  packageId?: string; // ID of the selected package
  packageName?: string; // Name of the selected package
}

// Represents the confirmed booking details returned by the service
export interface BookingResponse {
  bookingId: string;
  status: 'pending_deposit' | 'confirmed' | 'cancelled';
  totalCost: number;
  depositAmount: number;
  confirmationMessage: string;
}
