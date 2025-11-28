import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ambulances, getAvailableAmbulanceCount } from "@/data/clinicData";
import { toast } from "sonner";
import { Ambulance as AmbulanceIcon, Navigation, CheckCircle, XCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AmbulanceBooking = () => {
  const [patientName, setPatientName] = useState("");
  const [, setRefresh] = useState(0);

  const availableCount = getAvailableAmbulanceCount();

  const handleBookAmbulance = () => {
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    // Find the nearest available ambulance (lowest distanceKm)
    const availableAmbulances = ambulances.filter((a) => a.available);

    if (availableAmbulances.length === 0) {
      toast.error("No ambulances available", {
        description: "All ambulances are currently dispatched",
      });
      return;
    }

    // Sort by distance and pick the nearest
    const nearestAmbulance = availableAmbulances.sort((a, b) => a.distanceKm - b.distanceKm)[0];

    // Reserve the ambulance
    nearestAmbulance.available = false;
    nearestAmbulance.reservedBy = patientName.trim();
    nearestAmbulance.reservedAt = new Date();

    // Calculate estimated arrival time (assuming 30 km/h average speed)
    const estimatedMinutes = Math.ceil((nearestAmbulance.distanceKm / 30) * 60);

    toast.success("Ambulance dispatched!", {
      description: `${nearestAmbulance.id} with driver ${nearestAmbulance.driverName} is on the way. ETA: ${estimatedMinutes} minutes`,
    });

    setPatientName("");
    setRefresh((prev) => prev + 1);
  };

  const handleReleaseAmbulance = (ambulanceId: string) => {
    const ambulance = ambulances.find((a) => a.id === ambulanceId);
    if (ambulance && !ambulance.available) {
      ambulance.available = true;
      ambulance.reservedBy = undefined;
      ambulance.reservedAt = undefined;

      toast.success("Ambulance returned to base", {
        description: `${ambulance.id} is now available`,
      });

      setRefresh((prev) => prev + 1);
    }
  };

  const calculateETA = (distanceKm: number) => {
    const minutes = Math.ceil((distanceKm / 30) * 60);
    return `~${minutes} min`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AmbulanceIcon className="h-6 w-6 text-urgent" />
            Emergency Ambulance Service
          </CardTitle>
          <CardDescription>
            Smart dispatch system - {availableCount} / {ambulances.length} ambulances available
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert className="border-urgent/50 bg-urgent/5">
        <AlertDescription className="flex items-start gap-2">
          <Navigation className="h-4 w-4 text-urgent mt-0.5" />
          <span>
            System automatically dispatches the <strong>nearest available ambulance</strong> when you
            request emergency service.
          </span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Emergency Ambulance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyPatientName">Patient Name</Label>
            <Input
              id="emergencyPatientName"
              placeholder="Enter patient name for emergency pickup"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              maxLength={100}
            />
          </div>
          <Button
            onClick={handleBookAmbulance}
            className="w-full bg-urgent hover:bg-urgent/90"
            size="lg"
            disabled={!patientName.trim()}
          >
            <AmbulanceIcon className="h-5 w-5 mr-2" />
            Dispatch Nearest Ambulance
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Ambulance Fleet Status</h3>
        {ambulances
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .map((ambulance) => (
            <Card key={ambulance.id} className={!ambulance.available ? "bg-muted/50" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {ambulance.id}
                      <Badge variant={ambulance.available ? "default" : "secondary"}>
                        {ambulance.available ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Dispatched
                          </>
                        )}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Driver: {ambulance.driverName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-primary" />
                        {ambulance.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        ETA: {calculateETA(ambulance.distanceKm)}
                      </span>
                      <span className="text-muted-foreground">{ambulance.distanceKm} km away</span>
                    </div>
                  </div>
                </div>

                {!ambulance.available && ambulance.reservedBy && (
                  <div className="mb-4 p-3 bg-urgent/10 rounded-md text-sm">
                    <p className="font-medium">On mission for:</p>
                    <p className="text-muted-foreground">{ambulance.reservedBy}</p>
                    {ambulance.reservedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Dispatched: {new Date(ambulance.reservedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {!ambulance.available && (
                  <Button
                    onClick={() => handleReleaseAmbulance(ambulance.id)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Mark as Returned
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};
