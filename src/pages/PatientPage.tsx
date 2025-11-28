import { useState, useEffect } from "react";
import { PatientBooking } from "@/components/PatientBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patients, doctors } from "@/data/clinicData";
import { Calendar, Clock, User, Stethoscope, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const PatientPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    // Filter appointments for current user (by email match)
    if (user) {
      const userAppointments = patients.filter(
        (p) => p.email === user.email || p.name.toLowerCase() === user.name.toLowerCase()
      );
      setMyAppointments(userAppointments);
    }
  }, [user]);

  // Refresh appointments when new one is added
  const handleAppointmentBooked = () => {
    setRefresh(prev => prev + 1);
    if (user) {
      const userAppointments = patients.filter(
        (p) => p.email === user.email || p.name.toLowerCase() === user.name.toLowerCase()
      );
      setMyAppointments(userAppointments);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "checked":
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 font-bold";
      case "high":
        return "text-orange-600 font-semibold";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Patient Portal</h1>
        <p className="text-muted-foreground mb-8">Book appointments and manage your healthcare</p>

        <Tabs defaultValue="book" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="book" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book New Appointment
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Clock className="h-4 w-4" />
              My Appointments ({myAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book">
            <PatientBooking onAppointmentBooked={handleAppointmentBooked} />
          </TabsContent>

          <TabsContent value="appointments">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Appointment History</CardTitle>
                  <CardDescription>
                    View all your appointments and their approval status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">No appointments yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Book your first appointment to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAppointments
                        .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
                        .map((appointment) => {
                          const doctor = doctors.find(d => d.id === appointment.preferredDoctor);
                          return (
                            <Card key={appointment.id} className="border-2">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-semibold">
                                        Appointment #{appointment.id.slice(0, 8)}
                                      </h3>
                                      {getStatusBadge(appointment.status)}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <Stethoscope className="h-4 w-4 text-primary" />
                                          <span className="font-medium">Doctor:</span>
                                          <span>{doctor?.name || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">Specialty:</span>
                                          <span>{doctor?.specialty || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Clock className="h-4 w-4 text-primary" />
                                          <span className="font-medium">Time Slot:</span>
                                          <span>{appointment.timeSlot}</span>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">Issue:</span>
                                          <span className="text-muted-foreground">{appointment.issue}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">Urgency:</span>
                                          <span className={getUrgencyColor(appointment.urgency)}>
                                            {appointment.urgency.toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">Booked:</span>
                                          <span className="text-muted-foreground">
                                            {new Date(appointment.bookedAt).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="text-sm">
                                  {appointment.status === "pending" && (
                                    <p className="text-muted-foreground">
                                      ⏳ Your appointment is waiting for doctor's approval
                                    </p>
                                  )}
                                  {appointment.status === "accepted" && (
                                    <p className="text-green-600">
                                      ✅ Your appointment has been approved! Please arrive 10 minutes early.
                                    </p>
                                  )}
                                  {appointment.status === "rejected" && (
                                    <p className="text-destructive">
                                      ❌ This appointment was not approved. Please contact us or book another slot.
                                    </p>
                                  )}
                                  {appointment.status === "checked" && (
                                    <p className="text-muted-foreground">
                                      ✓ This appointment has been completed
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientPage;
