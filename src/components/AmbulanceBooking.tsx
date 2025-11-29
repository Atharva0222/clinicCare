import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ambulances, getAvailableAmbulanceCount } from "@/data/clinicData";
import { toast } from "sonner";
import { Ambulance as AmbulanceIcon, Navigation, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateDistance, ambulanceLocations } from "@/data/paymentData";

export const AmbulanceBooking = () => {
  const { t } = useLanguage();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [, setRefresh] = useState(0);

  const availableCount = getAvailableAmbulanceCount();

  const getUserLocation = () => {
    setIsGettingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);

          // Update ambulance distances based on user location
          ambulances.forEach((ambulance) => {
            const ambLocation = ambulanceLocations.find(loc => loc.id === ambulance.id);
            if (ambLocation) {
              ambulance.distanceKm = calculateDistance(
                location.lat,
                location.lon,
                ambLocation.latitude,
                ambLocation.longitude
              );
            }
          });

          toast.success(t('ambulance.locationSuccess'));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(t('ambulance.locationError'), {
            description: t('ambulance.locationErrorDesc'),
          });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error(t('ambulance.geolocationNotSupported'));
      setIsGettingLocation(false);
    }
  };

  const handleBookAmbulance = () => {
    if (!patientName.trim()) {
      toast.error(t('ambulance.enterPatientName'));
      return;
    }

    if (!patientPhone.trim()) {
      toast.error(t('ambulance.enterPhoneNumber'));
      return;
    }

    // Find the nearest available ambulance (lowest distanceKm)
    const availableAmbulances = ambulances.filter((a) => a.available);

    if (availableAmbulances.length === 0) {
      toast.error(t('ambulance.noAvailable'), {
        description: t('ambulance.allDispatched'),
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

    toast.success(t('ambulance.dispatchSuccess'), {
      description: `${t('ambulance.ambulanceId')}: ${nearestAmbulance.id}, ${t('ambulance.driver')}: ${nearestAmbulance.driverName}. ${t('ambulance.eta')}: ${estimatedMinutes} ${t('ambulance.minutes')}`,
    });

    setPatientName("");
    setPatientPhone("");
    setRefresh((prev) => prev + 1);
  };

  const handleReleaseAmbulance = (ambulanceId: string) => {
    const ambulance = ambulances.find((a) => a.id === ambulanceId);
    if (ambulance && !ambulance.available) {
      ambulance.available = true;
      ambulance.reservedBy = undefined;
      ambulance.reservedAt = undefined;

      toast.success(t('ambulance.returned'), {
        description: `${ambulance.id} ${t('ambulance.nowAvailable')}`,
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
            {t('ambulance.title')}
          </CardTitle>
          <CardDescription>
            {t('ambulance.smartDispatch')} - {availableCount} / {ambulances.length} {t('ambulance.available')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert className="border-urgent/50 bg-urgent/5">
        <AlertDescription className="flex items-start gap-2">
          <Navigation className="h-4 w-4 text-urgent mt-0.5" />
          <span>
            {t('ambulance.autoDispatch')} <strong>{t('ambulance.nearestAmbulance')}</strong> {t('ambulance.whenRequest')}
          </span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('ambulance.requestEmergency')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={getUserLocation}
            variant="outline"
            className="w-full"
            disabled={isGettingLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {userLocation
              ? t('ambulance.locationDetected')
              : isGettingLocation
              ? t('ambulance.gettingLocation')
              : t('ambulance.detectLocation')}
          </Button>

          {userLocation && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              📍 {t('ambulance.location')}: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="emergencyPatientName">{t('ambulance.patientName')}</Label>
            <Input
              id="emergencyPatientName"
              placeholder={t('ambulance.enterPatientName')}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPatientPhone">{t('ambulance.phoneNumber')}</Label>
            <Input
              id="emergencyPatientPhone"
              type="tel"
              placeholder={t('ambulance.enterPhoneNumber')}
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              maxLength={15}
            />
          </div>

          <Button
            onClick={handleBookAmbulance}
            className="w-full bg-urgent hover:bg-urgent/90"
            size="lg"
            disabled={!patientName.trim() || !patientPhone.trim()}
          >
            <AmbulanceIcon className="h-5 w-5 mr-2" />
            {t('ambulance.dispatchNearest')}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t('ambulance.fleetStatus')}</h3>
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
                            {t('ambulance.available.status')}
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('ambulance.dispatched')}
                          </>
                        )}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('ambulance.driver')}: {ambulance.driverName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-primary" />
                        {ambulance.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        {t('ambulance.eta')}: {calculateETA(ambulance.distanceKm)}
                      </span>
                      <span className="text-muted-foreground">{ambulance.distanceKm} {t('ambulance.kmAway')}</span>
                    </div>
                  </div>
                </div>

                {!ambulance.available && ambulance.reservedBy && (
                  <div className="mb-4 p-3 bg-urgent/10 rounded-md text-sm">
                    <p className="font-medium">{t('ambulance.onMission')}</p>
                    <p className="text-muted-foreground">{ambulance.reservedBy}</p>
                    {ambulance.reservedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('ambulance.dispatchedAt')}: {new Date(ambulance.reservedAt).toLocaleString()}
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
                    {t('ambulance.markReturned')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};
