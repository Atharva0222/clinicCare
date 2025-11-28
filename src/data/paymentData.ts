import { Invoice, ServicePricing } from "@/types/payment";

// Service pricing
export const servicePricing: ServicePricing = {
  consultation: 500, // Base consultation fee
  ambulance: 1500, // Base ambulance fee
  bedPerDay: {
    ICU: 5000,
    Emergency: 2500,
    General: 1000,
  },
  emergency: 2000, // Emergency service fee
};

// Tax rate (18% GST)
export const TAX_RATE = 0.18;

// Invoices storage
export let invoices: Invoice[] = [];

// Helper function to generate invoice number
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}${month}-${random}`;
};

// Helper function to calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Ambulance locations with coordinates
export interface AmbulanceLocation {
  id: string;
  latitude: number;
  longitude: number;
}

// Sample ambulance locations (you can update these with real coordinates)
export const ambulanceLocations: AmbulanceLocation[] = [
  { id: "amb-1", latitude: 28.6139, longitude: 77.2090 }, // Downtown
  { id: "amb-2", latitude: 28.7041, longitude: 77.1025 }, // North District
  { id: "amb-3", latitude: 28.6692, longitude: 77.4538 }, // East Side
  { id: "amb-4", latitude: 28.5355, longitude: 77.3910 }, // West End
  { id: "amb-5", latitude: 28.5244, longitude: 77.1855 }, // South Zone
];
