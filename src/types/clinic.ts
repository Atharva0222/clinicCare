// Core data types for the clinic management system

export type AppointmentStatus = "pending" | "accepted" | "rejected" | "checked";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface Patient {
  id: string;
  name: string;
  age: number;
  email?: string;
  phone?: string;
  issue: string;
  preferredDoctor: string;
  timeSlot: string;
  urgency: UrgencyLevel;
  status: AppointmentStatus;
  bookedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
}

export interface Bed {
  id: string;
  type: string;
  available: boolean;
  reservedBy?: string;
  reservedAt?: Date;
}

export interface Ambulance {
  id: string;
  driverName: string;
  location: string;
  available: boolean;
  distanceKm: number;
  reservedBy?: string;
  reservedAt?: Date;
}
