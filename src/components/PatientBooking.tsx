import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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
  const [customSymptom, setCustomSymptom] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<any>(null);

  const commonSymptoms = [
    t('symptoms.fever'),
    t('symptoms.cough'),
    t('symptoms.coldFlu'),
    t('symptoms.headache'),
    t('symptoms.stomachache'),
    t('symptoms.bodyPain'),
    t('symptoms.chestPain'),
    t('symptoms.breathingDifficulty'),
    t('symptoms.dizziness'),
    t('symptoms.nausea'),
    t('symptoms.skinRash'),
    t('symptoms.eyeProblems'),
    t('symptoms.earPain'),
    t('symptoms.toothache'),
    t('symptoms.backPain'),
    t('symptoms.jointPain'),
    t('symptoms.diabetes'),
    t('symptoms.bloodPressure'),
    t('symptoms.injury'),
    t('symptoms.checkup'),
    t('symptoms.other'),
  ];

  const handleSymptomChange = (value: string) => {
    setFormData({ ...formData, issue: value });
    if (value !== t('symptoms.other')) {
      setCustomSymptom("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get final issue value (use custom symptom if "Other" is selected)
    const finalIssue = formData.issue === t('symptoms.other') ? customSymptom : formData.issue;

    // Validation
    if (!formData.name || !formData.age || !formData.email || !formData.phone || !finalIssue || !formData.preferredDoctor || !formData.timeSlot) {
      toast.error(t('booking.fillAllFields'));
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      toast.error(t('booking.validAge'));
      return;
    }

    // Create new patient appointment
    const newPatient = {
      id: generateId(),
      name: formData.name.trim(),
      age,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      issue: finalIssue.trim(),
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

    toast.success(t('booking.bookingSuccess'), {
      description: `${t('booking.pendingApproval')} ${t('booking.appointmentId')}: ${pendingAppointment.id.slice(0, 8)}`,
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
    setCustomSymptom("");
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
          {t('booking.title')}
        </CardTitle>
        <CardDescription>{t('booking.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('booking.patientName')}
            </Label>
            <Input
              id="name"
              placeholder={t('booking.enterName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t('booking.age')}</Label>
              <Input
                id="age"
                type="number"
                placeholder={t('booking.enterAge')}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="0"
                max="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('booking.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('booking.enterPhone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('booking.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('booking.enterEmail')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">{t('booking.issue')}</Label>
            <Select
              value={formData.issue}
              onValueChange={handleSymptomChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('booking.selectSymptom')} />
              </SelectTrigger>
              <SelectContent>
                {commonSymptoms.map((symptom) => (
                  <SelectItem key={symptom} value={symptom}>
                    {symptom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.issue === t('symptoms.other') && (
              <Input
                id="customSymptom"
                placeholder={t('booking.describeSymptom')}
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                maxLength={200}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">{t('booking.urgency')}</Label>
            <Select
              value={formData.urgency}
              onValueChange={(value: UrgencyLevel) => setFormData({ ...formData, urgency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('booking.urgencyLow')}</SelectItem>
                <SelectItem value="medium">{t('booking.urgencyMedium')}</SelectItem>
                <SelectItem value="high">{t('booking.urgencyHigh')}</SelectItem>
                <SelectItem value="critical">{t('booking.urgencyCritical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              {t('booking.preferredDoctor')}
            </Label>
            <Select
              value={formData.preferredDoctor}
              onValueChange={(value) => setFormData({ ...formData, preferredDoctor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('booking.selectDoctor')} />
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
              {t('booking.timeSlot')}
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
            {t('booking.continuePayment')}
          </Button>
        </form>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('payment.title')}</DialogTitle>
              <DialogDescription>
                {pendingAppointment && (
                  <>
                    {t('booking.consultationFee')} {formData.urgency} {t('booking.urgencyAppointment')}
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
              <DialogTitle>{t('invoice.title')}</DialogTitle>
              <DialogDescription>{t('booking.invoiceDescription')}</DialogDescription>
            </DialogHeader>
            {currentInvoice && <InvoiceDisplay invoice={currentInvoice} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
