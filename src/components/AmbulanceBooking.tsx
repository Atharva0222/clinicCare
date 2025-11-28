import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ambulances, getAvailableAmbulanceCount, generateId } from "@/data/clinicData";
import { toast } from "sonner";
import { Ambulance as AmbulanceIcon, Navigation, CheckCircle, XCircle, Clock, MapPin, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentForm } from "@/components/PaymentForm";
import { InvoiceDisplay } from "@/components/InvoiceDisplay";
import { Invoice, PaymentDetails, InvoiceItem } from "@/types/payment";
import { servicePricing, TAX_RATE, generateInvoiceNumber, calculateDistance, ambulanceLocations, invoices } from "@/data/paymentData";

export const AmbulanceBooking = () => {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
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

          toast.success("Location detected successfully");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location", {
            description: "Using default distances. Please enable location services for accurate results.",
          });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
    }
  };

  const handleBookAmbulance = () => {
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    if (!patientPhone.trim()) {
      toast.error("Please enter phone number");
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

    setSelectedAmbulance(nearestAmbulance);
    setShowPayment(true);
  };

  const handlePaymentComplete = (payment: PaymentDetails) => {
    if (!selectedAmbulance) return;

    // Calculate distance-based pricing
    const distanceCharge = selectedAmbulance.distanceKm * 50; // ₹50 per km
    const basePrice = servicePricing.ambulance;
    const totalBeforeTax = basePrice + distanceCharge;
    const tax = totalBeforeTax * TAX_RATE;
    const total = totalBeforeTax + tax;

    // Create invoice items
    const items: InvoiceItem[] = [
      {
        id: generateId(),
        description: "Ambulance Service (Base Fee)",
        quantity: 1,
        unitPrice: basePrice,
        total: basePrice,
      },
      {
        id: generateId(),
        description: `Distance Charge (${selectedAmbulance.distanceKm} km @ ₹50/km)`,
        quantity: 1,
        unitPrice: distanceCharge,
        total: distanceCharge,
      },
    ];

    // Create invoice
    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      serviceType: "ambulance",
      serviceDescription: `Emergency Ambulance - ${selectedAmbulance.id} - Driver: ${selectedAmbulance.driverName}`,
      items,
      subtotal: totalBeforeTax,
      tax,
      discount: 0,
      total,
      payment,
      issuedAt: new Date(),
    };

    invoices.push(invoice);

    // Reserve the ambulance
    selectedAmbulance.available = false;
    selectedAmbulance.reservedBy = patientName.trim();
    selectedAmbulance.reservedAt = new Date();

    // Calculate estimated arrival time (assuming 30 km/h average speed)
    const estimatedMinutes = Math.ceil((selectedAmbulance.distanceKm / 30) * 60);

    setShowPayment(false);
    setCurrentInvoice(invoice);
    setShowInvoice(true);

    toast.success("Ambulance dispatched!", {
      description: `${selectedAmbulance.id} with driver ${selectedAmbulance.driverName} is on the way. ETA: ${estimatedMinutes} minutes`,
    });

    setPatientName("");
    setPatientPhone("");
    setSelectedAmbulance(null);
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
          <Button
            onClick={getUserLocation}
            variant="outline"
            className="w-full"
            disabled={isGettingLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {userLocation
              ? "Location Detected ✓"
              : isGettingLocation
              ? "Getting Location..."
              : "Detect My Location"}
          </Button>

          {userLocation && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              📍 Location: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="emergencyPatientPhone">Phone Number</Label>
            <Input
              id="emergencyPatientPhone"
              type="tel"
              placeholder="Enter contact number"
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
            <CreditCard className="h-5 w-5 mr-2" />
            Continue to Payment
          </Button>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              {selectedAmbulance && (
                <>
                  Ambulance: {selectedAmbulance.id} | Distance: {selectedAmbulance.distanceKm} km
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedAmbulance && (
            <PaymentForm
              amount={
                servicePricing.ambulance +
                selectedAmbulance.distanceKm * 50 +
                (servicePricing.ambulance + selectedAmbulance.distanceKm * 50) * TAX_RATE
              }
              onPaymentComplete={handlePaymentComplete}
              onCancel={() => setShowPayment(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Your ambulance service invoice</DialogDescription>
          </DialogHeader>
          {currentInvoice && <InvoiceDisplay invoice={currentInvoice} />}
        </DialogContent>
      </Dialog>

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
