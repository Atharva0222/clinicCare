// Local in-code data storage (simulating database)
import { Doctor, Bed, Ambulance, Patient } from "@/types/clinic";

// Doctors data
export let doctors: Doctor[] = [
  { id: "d1", name: "Dr. Sarah Johnson", specialty: "General Medicine", available: true },
  { id: "d2", name: "Dr. Michael Chen", specialty: "Cardiology", available: true },
  { id: "d3", name: "Dr. Emily Rodriguez", specialty: "Pediatrics", available: true },
  { id: "d4", name: "Dr. James Williams", specialty: "Orthopedics", available: true },
  { id: "d5", name: "Dr. Priya Sharma", specialty: "Emergency Medicine", available: true },
];

// Beds data (20 beds total)
export let beds: Bed[] = Array.from({ length: 20 }, (_, i) => ({
  id: `bed-${i + 1}`,
  type: i < 5 ? "ICU" : i < 10 ? "Emergency" : "General",
  available: true,
}));

// Ambulances data with location and distance mapping
export let ambulances: Ambulance[] = [
  { id: "amb-1", driverName: "John Smith", location: "Downtown", available: true, distanceKm: 2.5 },
  { id: "amb-2", driverName: "Maria Garcia", location: "North District", available: true, distanceKm: 4.0 },
  { id: "amb-3", driverName: "David Lee", location: "East Side", available: true, distanceKm: 3.2 },
  { id: "amb-4", driverName: "Fatima Ahmed", location: "West End", available: true, distanceKm: 5.1 },
  { id: "amb-5", driverName: "Robert Brown", location: "South Zone", available: true, distanceKm: 1.8 },
];

// Patients appointments (starts empty, gets populated via bookings)
export let patients: Patient[] = [];

// Helper function to generate unique ID
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Get available bed count
export const getAvailableBedCount = () => beds.filter(b => b.available).length;

// Get available ambulance count
export const getAvailableAmbulanceCount = () => ambulances.filter(a => a.available).length;
