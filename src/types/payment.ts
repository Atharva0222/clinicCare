export type PaymentMethod = "cash" | "card" | "upi" | "insurance";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed";
export type ServiceType = "consultation" | "ambulance" | "bed" | "pharmacy" | "emergency";

export interface PaymentDetails {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  serviceType: ServiceType;
  serviceDescription: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: PaymentDetails;
  issuedAt: Date;
  dueDate?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServicePricing {
  consultation: number;
  ambulance: number;
  bedPerDay: {
    ICU: number;
    Emergency: number;
    General: number;
  };
  emergency: number;
}
