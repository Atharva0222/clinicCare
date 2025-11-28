// Local pharmacy and medicine data storage
import { Medicine, Prescription } from "@/types/pharmacy";

// Medicine inventory (50+ common medicines)
export let medicines: Medicine[] = [
  // Pain Relief
  { id: "med-1", name: "Paracetamol 500mg", category: "Pain Relief", stock: 500, unit: "tablets", price: 0.5, minStockLevel: 100 },
  { id: "med-2", name: "Ibuprofen 400mg", category: "Pain Relief", stock: 300, unit: "tablets", price: 0.8, minStockLevel: 80 },
  { id: "med-3", name: "Aspirin 75mg", category: "Pain Relief", stock: 250, unit: "tablets", price: 0.3, minStockLevel: 50 },
  
  // Antibiotics
  { id: "med-4", name: "Amoxicillin 500mg", category: "Antibiotics", stock: 200, unit: "capsules", price: 2.5, minStockLevel: 50 },
  { id: "med-5", name: "Azithromycin 250mg", category: "Antibiotics", stock: 150, unit: "tablets", price: 3.0, minStockLevel: 40 },
  { id: "med-6", name: "Ciprofloxacin 500mg", category: "Antibiotics", stock: 180, unit: "tablets", price: 2.8, minStockLevel: 45 },
  
  // Cardiovascular
  { id: "med-7", name: "Amlodipine 5mg", category: "Cardiovascular", stock: 400, unit: "tablets", price: 1.2, minStockLevel: 100 },
  { id: "med-8", name: "Atorvastatin 20mg", category: "Cardiovascular", stock: 350, unit: "tablets", price: 1.5, minStockLevel: 80 },
  { id: "med-9", name: "Metoprolol 50mg", category: "Cardiovascular", stock: 280, unit: "tablets", price: 1.8, minStockLevel: 70 },
  
  // Diabetes
  { id: "med-10", name: "Metformin 500mg", category: "Diabetes", stock: 450, unit: "tablets", price: 0.7, minStockLevel: 120 },
  { id: "med-11", name: "Glimepiride 2mg", category: "Diabetes", stock: 200, unit: "tablets", price: 1.3, minStockLevel: 60 },
  { id: "med-12", name: "Insulin (Rapid Acting)", category: "Diabetes", stock: 50, unit: "vials", price: 25.0, minStockLevel: 15 },
  
  // Respiratory
  { id: "med-13", name: "Salbutamol Inhaler", category: "Respiratory", stock: 80, unit: "inhalers", price: 8.5, minStockLevel: 20 },
  { id: "med-14", name: "Montelukast 10mg", category: "Respiratory", stock: 220, unit: "tablets", price: 2.2, minStockLevel: 50 },
  { id: "med-15", name: "Cetirizine 10mg", category: "Respiratory", stock: 380, unit: "tablets", price: 0.6, minStockLevel: 100 },
  
  // Gastrointestinal
  { id: "med-16", name: "Omeprazole 20mg", category: "Gastrointestinal", stock: 320, unit: "capsules", price: 1.0, minStockLevel: 80 },
  { id: "med-17", name: "Ranitidine 150mg", category: "Gastrointestinal", stock: 280, unit: "tablets", price: 0.8, minStockLevel: 70 },
  { id: "med-18", name: "Loperamide 2mg", category: "Gastrointestinal", stock: 150, unit: "capsules", price: 0.9, minStockLevel: 40 },
  
  // Vitamins & Supplements
  { id: "med-19", name: "Vitamin D3 1000IU", category: "Vitamins", stock: 500, unit: "tablets", price: 0.4, minStockLevel: 150 },
  { id: "med-20", name: "Calcium + Vitamin D", category: "Vitamins", stock: 400, unit: "tablets", price: 0.6, minStockLevel: 120 },
  { id: "med-21", name: "Multivitamin", category: "Vitamins", stock: 450, unit: "tablets", price: 0.5, minStockLevel: 130 },
  
  // Topical
  { id: "med-22", name: "Hydrocortisone Cream 1%", category: "Topical", stock: 100, unit: "tubes", price: 4.5, minStockLevel: 25 },
  { id: "med-23", name: "Clotrimazole Cream", category: "Topical", stock: 90, unit: "tubes", price: 5.0, minStockLevel: 20 },
  { id: "med-24", name: "Mupirocin Ointment", category: "Topical", stock: 70, unit: "tubes", price: 6.5, minStockLevel: 18 },
];

// Prescriptions (starts empty)
export let prescriptions: Prescription[] = [];

// Helper function to generate unique prescription ID
export const generatePrescriptionId = () => `rx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Get low stock medicines
export const getLowStockMedicines = () => medicines.filter(m => m.stock <= m.minStockLevel);

// Update medicine stock after fulfillment
export const updateMedicineStock = (medicineId: string, quantity: number) => {
  const medicine = medicines.find(m => m.id === medicineId);
  if (medicine) {
    medicine.stock = Math.max(0, medicine.stock - quantity);
  }
};

// Add stock to medicine
export const addMedicineStock = (medicineId: string, quantity: number) => {
  const medicine = medicines.find(m => m.id === medicineId);
  if (medicine) {
    medicine.stock += quantity;
  }
};
