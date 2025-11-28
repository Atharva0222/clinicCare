import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { doctors, patients, generateId } from "@/data/clinicData";
import { UrgencyLevel } from "@/types/clinic";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";

export const PatientBooking = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    issue: "",
    preferredDoctor: "",
    timeSlot: "",
    urgency: "medium" as UrgencyLevel,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.age || !formData.issue || !formData.preferredDoctor || !formData.timeSlot) {
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
      issue: formData.issue.trim(),
      preferredDoctor: formData.preferredDoctor,
      timeSlot: formData.timeSlot,
      urgency: formData.urgency,
      status: "pending" as const,
      bookedAt: new Date(),
    };

    patients.push(newPatient);

    toast.success("Appointment booked successfully!", {
      description: `Your appointment is pending doctor approval. Appointment ID: ${newPatient.id.slice(0, 8)}`,
    });

    // Reset form
    setFormData({
      name: "",
      age: "",
      issue: "",
      preferredDoctor: "",
      timeSlot: "",
      urgency: "medium",
    });
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
            Book Appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
