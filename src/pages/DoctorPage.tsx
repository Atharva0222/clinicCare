import { useState, useEffect } from "react";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patients } from "@/data/clinicData";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const DoctorPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setRefresh] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);

  useEffect(() => {
    updateAppointments();
  }, []);

  const updateAppointments = () => {
    setPendingAppointments(patients.filter(p => p.status === "pending"));
    setAllAppointments(patients);
    setRefresh(prev => prev + 1);
  };

  const handleApprove = (appointmentId: string) => {
    const appointment = patients.find(p => p.id === appointmentId);
    if (appointment) {
      appointment.status = "accepted";
      toast.success("Appointment approved!", {
        description: `${appointment.name}'s appointment has been approved`,
      });
      updateAppointments();
    }
  };

  const handleReject = (appointmentId: string) => {
    const appointment = patients.find(p => p.id === appointmentId);
    if (appointment) {
      appointment.status = "rejected";
      toast.error("Appointment rejected", {
        description: `${appointment.name}'s appointment has been rejected`,
      });
      updateAppointments();
    }
  };

  const handleMarkCompleted = (appointmentId: string) => {
    const appointment = patients.find(p => p.id === appointmentId);
    if (appointment) {
      appointment.status = "checked";
      toast.success("Appointment marked as completed");
      updateAppointments();
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
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Doctor Portal</h1>
        <p className="text-muted-foreground mb-8">Manage patient appointments and prescriptions</p>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="requests" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Requests ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Calendar className="h-4 w-4" />
              All Appointments ({allAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2">
              <FileText className="h-4 w-4" />
              Write Prescription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Appointment Requests</CardTitle>
                  <CardDescription>
                    Review and approve or reject patient appointment requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">No pending requests</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        All appointment requests have been reviewed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingAppointments
                        .sort((a, b) => {
                          // Sort by urgency first, then by time
                          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                          if (urgencyOrder[a.urgency as keyof typeof urgencyOrder] !== urgencyOrder[b.urgency as keyof typeof urgencyOrder]) {
                            return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
                          }
                          return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime();
                        })
                        .map((appointment) => (
                          <Card key={appointment.id} className="border-2 border-orange-200">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">
                                      {appointment.name}, {appointment.age} years
                                    </h3>
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Patient:</span>
                                        <span>{appointment.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Age:</span>
                                        <span>{appointment.age} years</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Requested Slot:</span>
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
                                        <span className="font-medium">Requested:</span>
                                        <span className="text-muted-foreground">
                                          {new Date(appointment.bookedAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(appointment.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Appointment
                                </Button>
                                <Button
                                  onClick={() => handleReject(appointment.id)}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>
                    View all patient appointments and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">No appointments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allAppointments
                        .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
                        .map((appointment) => (
                          <Card key={appointment.id} className="border-2">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">
                                      {appointment.name}, {appointment.age} years
                                    </h3>
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Contact:</span>
                                        <span>{appointment.phone || appointment.email}</span>
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
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {appointment.status === "accepted" && (
                                <>
                                  <Separator className="my-4" />
                                  <Button
                                    onClick={() => handleMarkCompleted(appointment.id)}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Completed
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <DoctorDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorPage;
