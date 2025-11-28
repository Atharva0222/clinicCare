// Pharmacy and prescription data types

export type PrescriptionStatus = "pending" | "fulfilled" | "cancelled";

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  minStockLevel: number;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  notes: string;
  status: PrescriptionStatus;
  createdAt: Date;
  fulfilledAt?: Date;
  fulfilledBy?: string;
}
