import { useState } from "react";

interface PatientBookingProps {
  onAppointmentBooked?: () => void;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { doctors, patients, generateId } from "@/data/clinicData";
import { UrgencyLevel } from "@/types/clinic";
import { Calendar, Clock, User, Stethoscope, CreditCard } from "lucide-react";
import { PaymentForm } from "@/components/PaymentForm";
import { InvoiceDisplay } from "@/components/InvoiceDisplay";
import { Invoice, PaymentDetails, InvoiceItem } from "@/types/payment";
import { servicePricing, TAX_RATE, generateInvoiceNumber, invoices } from "@/data/paymentData";

export const PatientBooking: React.FC<PatientBookingProps> = ({ onAppointmentBooked }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    issue: "",
    preferredDoctor: "",
    timeSlot: "",
    urgency: "medium" as UrgencyLevel,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.age || !formData.email || !formData.phone || !formData.issue || !formData.preferredDoctor || !formData.timeSlot) {
      toast.error("Please fill in all fields");
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      toast.error("Please enter a valid age");
      return;
    }

    // Create new patient appointment
    const newPatient = {
      id: generateId(),
      name: formData.name.trim(),
      age,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      issue: formData.issue.trim(),
      preferredDoctor: formData.preferredDoctor,
      timeSlot: formData.timeSlot,
      urgency: formData.urgency,
      status: "pending" as const,
      bookedAt: new Date(),
    };

    setPendingAppointment(newPatient);
    setShowPayment(true);
  };

  const handlePaymentComplete = (payment: PaymentDetails) => {
    if (!pendingAppointment) return;

    // Add appointment to patients list
    patients.push(pendingAppointment);

    // Calculate pricing based on urgency
    const urgencyMultiplier = {
      low: 1,
      medium: 1.2,
      high: 1.5,
      critical: 2,
    }[formData.urgency];

    const basePrice = servicePricing.consultation * urgencyMultiplier;
    const tax = basePrice * TAX_RATE;
    const total = basePrice + tax;

    // Get doctor name
    const doctor = doctors.find(d => d.id === formData.preferredDoctor);

    // Create invoice items
    const items: InvoiceItem[] = [
      {
        id: generateId(),
        description: `Consultation - ${doctor?.name} (${doctor?.specialty})`,
        quantity: 1,
        unitPrice: servicePricing.consultation,
        total: servicePricing.consultation,
      },
    ];

    if (urgencyMultiplier > 1) {
      const urgencyCharge = servicePricing.consultation * (urgencyMultiplier - 1);
      items.push({
        id: generateId(),
        description: `${formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Urgency Charge`,
        quantity: 1,
        unitPrice: urgencyCharge,
        total: urgencyCharge,
      });
    }

    // Create invoice
    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      patientName: formData.name.trim(),
      patientEmail: formData.email.trim(),
      patientPhone: formData.phone.trim(),
      serviceType: "consultation",
      serviceDescription: `Doctor Consultation - ${formData.timeSlot} - ${formData.urgency} urgency`,
      items,
      subtotal: basePrice,
      tax,
      discount: 0,
      total,
      payment,
      issuedAt: new Date(),
    };

    invoices.push(invoice);

    setShowPayment(false);
    setCurrentInvoice(invoice);
    setShowInvoice(true);

    toast.success("Appointment booked successfully!", {
      description: `Your appointment is pending doctor approval. Appointment ID: ${pendingAppointment.id.slice(0, 8)}`,
    });

    // Reset form
    setFormData({
      name: "",
      age: "",
      email: "",
      phone: "",
      issue: "",
      preferredDoctor: "",
      timeSlot: "",
      urgency: "medium",
    });
    setPendingAppointment(null);

    // Notify parent component
    if (onAppointmentBooked) {
      onAppointmentBooked();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Book Appointment
        </CardTitle>
        <CardDescription>Fill in your details to schedule a consultation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Name
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="0"
                max="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">Medical Issue / Reason</Label>
            <Input
              id="issue"
              placeholder="Describe your symptoms or reason for visit"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select
              value={formData.urgency}
              onValueChange={(value: UrgencyLevel) => setFormData({ ...formData, urgency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Routine checkup</SelectItem>
                <SelectItem value="medium">Medium - Standard consultation</SelectItem>
                <SelectItem value="high">High - Urgent attention needed</SelectItem>
                <SelectItem value="critical">Critical - Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Preferred Doctor
            </Label>
            <Select
              value={formData.preferredDoctor}
              onValueChange={(value) => setFormData({ ...formData, preferredDoctor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSlot" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time Slot
            </Label>
            <Input
              id="timeSlot"
              type="time"
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <CreditCard className="h-5 w-5 mr-2" />
            Continue to Payment
          </Button>
        </form>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                {pendingAppointment && (
                  <>
                    Consultation fee for {formData.urgency} urgency appointment
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {pendingAppointment && (
              <PaymentForm
                amount={
                  servicePricing.consultation *
                  ({
                    low: 1,
                    medium: 1.2,
                    high: 1.5,
                    critical: 2,
                  }[formData.urgency]) *
                  (1 + TAX_RATE)
                }
                onPaymentComplete={handlePaymentComplete}
                onCancel={() => {
                  setShowPayment(false);
                  setPendingAppointment(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice</DialogTitle>
              <DialogDescription>Your appointment booking invoice</DialogDescription>
            </DialogHeader>
            {currentInvoice && <InvoiceDisplay invoice={currentInvoice} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
