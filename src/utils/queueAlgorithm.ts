// Smart Queue Algorithm
// Sorts appointments based on: urgency > senior citizen priority > appointment time

import { Patient, UrgencyLevel } from "@/types/clinic";

const urgencyWeight: Record<UrgencyLevel, number> = {
  critical: 1000,
  high: 100,
  medium: 50,
  low: 10,
};

const seniorCitizenAge = 60;
const seniorBonus = 500; // Priority bonus for seniors

/**
 * Calculate priority score for a patient
 * Higher score = higher priority in queue
 */
export const calculatePriority = (patient: Patient): number => {
  let score = 0;

  // 1. Urgency level (most important)
  score += urgencyWeight[patient.urgency];

  // 2. Senior citizen priority
  if (patient.age >= seniorCitizenAge) {
    score += seniorBonus;
  }

  // 3. Time slot (earlier appointments get slight priority)
  // Convert time to minutes from midnight, then invert for priority
  const [hours, minutes] = patient.timeSlot.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  // Earlier times get higher score (max 24 hours = 1440 minutes)
  score += (1440 - timeInMinutes) / 10;

  return score;
};

/**
 * Sort patients into smart queue order
 * Returns sorted array (highest priority first)
 */
export const sortSmartQueue = (patients: Patient[]): Patient[] => {
  return [...patients]
    .filter(p => p.status === "accepted") // Only show accepted appointments in queue
    .sort((a, b) => {
      const scoreA = calculatePriority(a);
      const scoreB = calculatePriority(b);
      return scoreB - scoreA; // Descending order (highest priority first)
    });
};

/**
 * Get today's appointments only
 */
export const getTodayAppointments = (patients: Patient[]): Patient[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return patients.filter(p => {
    const appointmentDate = new Date(p.bookedAt);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  });
};
