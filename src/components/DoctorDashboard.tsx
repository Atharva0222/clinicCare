import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { patients } from "@/data/clinicData";
import { Patient, AppointmentStatus, UrgencyLevel } from "@/types/clinic";
import { toast } from "sonner";
import { Check, X, UserCheck, Clock, AlertCircle, Activity, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTodayAppointments, sortSmartQueue } from "@/utils/queueAlgorithm";
import { PrescriptionForm } from "@/components/PrescriptionForm";

const urgencyColors: Record<UrgencyLevel, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-warning text-warning-foreground",
  critical: "bg-urgent text-urgent-foreground",
};

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-warning text-warning-foreground",
  accepted: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  checked: "bg-muted text-muted-foreground",
};

export const DoctorDashboard = () => {
  const [, setRefresh] = useState(0); // Force re-render
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleAction = (patientId: string, action: AppointmentStatus) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      patient.status = action;
      setRefresh((prev) => prev + 1);

      const actionTexts = {
        accepted: "accepted",
        rejected: "rejected",
        checked: "marked as checked",
      };
      toast.success(`Appointment ${actionTexts[action] || "updated"}`, {
        description: `Patient: ${patient.name}`,
      });
    }
  };

  const pendingAppointments = patients.filter((p) => p.status === "pending");
  const todayQueue = sortSmartQueue(getTodayAppointments(patients));
  const allAppointments = patients.filter((p) => p.status !== "pending");

  const openPrescriptionDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setPrescriptionDialogOpen(true);
  };

  const renderPatientCard = (patient: Patient, showActions: boolean = false) => (
    <Card key={patient.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {patient.name}
              {patient.age >= 60 && (
                <Badge variant="outline" className="text-xs">
                  Senior
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Badge className={urgencyColors[patient.urgency]}>{patient.urgency}</Badge>
            <Badge className={statusColors[patient.status]}>{patient.status}</Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm">
            <span className="font-medium">Issue:</span> {patient.issue}
          </p>
          <p className="text-sm">
            <span className="font-medium">Time Slot:</span> {patient.timeSlot}
          </p>
          <p className="text-sm text-muted-foreground">
            Booked: {new Date(patient.bookedAt).toLocaleString()}
          </p>
        </div>

        {showActions && patient.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAction(patient.id, "accepted")}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction(patient.id, "rejected")}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {showActions && patient.status === "accepted" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction(patient.id, "checked")}
              className="flex-1"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Mark as Checked
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openPrescriptionDialog(patient)}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-1" />
              Write Prescription
            </Button>
          </div>
        )}

        {showActions && patient.status === "checked" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openPrescriptionDialog(patient)}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-1" />
            Write Prescription
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {selectedPatient && (
        <PrescriptionForm
          patient={selectedPatient}
          open={prescriptionDialogOpen}
          onClose={() => {
            setPrescriptionDialogOpen(false);
            setSelectedPatient(null);
          }}
        />
      )}

      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Doctor Dashboard
          </CardTitle>
          <CardDescription>Manage appointments and patient queue</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Today's Queue ({todayQueue.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Appointments ({allAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No pending appointments
              </CardContent>
            </Card>
          ) : (
            pendingAppointments.map((patient) => renderPatientCard(patient, true))
          )}
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          {todayQueue.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No accepted appointments for today
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-4 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Queue sorted by: <span className="font-semibold">Urgency</span> →{" "}
                    <span className="font-semibold">Senior Priority</span> →{" "}
                    <span className="font-semibold">Time Slot</span>
                  </p>
                </CardContent>
              </Card>
              {todayQueue.map((patient, index) => (
                <div key={patient.id} className="relative">
                  <div className="absolute -left-4 top-8 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {renderPatientCard(patient, true)}
                </div>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {allAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No appointments yet
              </CardContent>
            </Card>
          ) : (
            allAppointments.map((patient) => renderPatientCard(patient, false))
          )}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};
