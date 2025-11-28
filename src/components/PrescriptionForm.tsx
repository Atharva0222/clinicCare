import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Patient } from "@/types/clinic";
import { PrescriptionItem } from "@/types/pharmacy";
import { medicines, prescriptions, generatePrescriptionId } from "@/data/pharmacyData";
import { doctors } from "@/data/clinicData";
import { Plus, X, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PrescriptionFormProps {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}

export const PrescriptionForm = ({ patient, open, onClose }: PrescriptionFormProps) => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [notes, setNotes] = useState("");
  const [currentItem, setCurrentItem] = useState({
    medicineId: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
  });

  const addItem = () => {
    if (!currentItem.medicineId || !currentItem.dosage || !currentItem.frequency || !currentItem.duration || !currentItem.quantity) {
      toast.error("Please fill in all medication details");
      return;
    }

    const medicine = medicines.find(m => m.id === currentItem.medicineId);
    if (!medicine) return;

    const quantity = parseInt(currentItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (quantity > medicine.stock) {
      toast.error(`Insufficient stock. Available: ${medicine.stock} ${medicine.unit}`);
      return;
    }

    const newItem: PrescriptionItem = {
      medicineId: currentItem.medicineId,
      medicineName: medicine.name,
      dosage: currentItem.dosage.trim(),
      frequency: currentItem.frequency.trim(),
      duration: currentItem.duration.trim(),
      quantity,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      medicineId: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
    });
    toast.success("Medication added to prescription");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Please add at least one medication");
      return;
    }

    const doctor = doctors.find(d => d.id === patient.preferredDoctor);
    if (!doctor) {
      toast.error("Doctor not found");
      return;
    }

    const newPrescription = {
      id: generatePrescriptionId(),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      items,
      notes: notes.trim(),
      status: "pending" as const,
      createdAt: new Date(),
    };

    prescriptions.push(newPrescription);

    toast.success("Prescription created successfully!", {
      description: `Prescription ${newPrescription.id.slice(0, 12)} sent to pharmacy`,
    });

    // Reset and close
    setItems([]);
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Write Prescription
          </DialogTitle>
          <DialogDescription>
            Patient: {patient.name} (Age: {patient.age})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Medication Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-sm">Add Medication</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicine</Label>
                  <Select
                    value={currentItem.medicineId}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, medicineId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((med) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.name} - Stock: {med.stock} {med.unit}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 1 tablet"
                    value={currentItem.dosage}
                    onChange={(e) => setCurrentItem({ ...currentItem, dosage: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Twice daily"
                    value={currentItem.frequency}
                    onChange={(e) => setCurrentItem({ ...currentItem, frequency: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 7 days"
                    value={currentItem.duration}
                    onChange={(e) => setCurrentItem({ ...currentItem, duration: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="quantity">Total Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Total number of units"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    min="1"
                  />
                </div>
              </div>

              <Button onClick={addItem} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Prescription
              </Button>
            </CardContent>
          </Card>

          {/* Prescription Items List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Prescription Items ({items.length})</h3>
              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.medicineName}</h4>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <p>Dosage: {item.dosage}</p>
                        <p>Frequency: {item.frequency}</p>
                        <p>Duration: {item.duration}</p>
                        <Badge variant="secondary">Qty: {item.quantity}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1" disabled={items.length === 0}>
              Create Prescription
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
