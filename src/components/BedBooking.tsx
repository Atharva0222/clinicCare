import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { beds, getAvailableBedCount } from "@/data/clinicData";
import { toast } from "sonner";
import { Bed as BedIcon, CheckCircle, XCircle } from "lucide-react";

export const BedBooking = () => {
  const [patientName, setPatientName] = useState("");
  const [, setRefresh] = useState(0);

  const availableBeds = beds.filter((b) => b.available);
  const totalBeds = beds.length;
  const availableCount = getAvailableBedCount();

  const handleBookBed = (bedId: string) => {
    if (!patientName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    const bed = beds.find((b) => b.id === bedId);
    if (bed && bed.available) {
      bed.available = false;
      bed.reservedBy = patientName.trim();
      bed.reservedAt = new Date();

      toast.success("Bed reserved successfully!", {
        description: `Bed ${bed.id} (${bed.type}) reserved for ${patientName}`,
      });

      setPatientName("");
      setRefresh((prev) => prev + 1);
    }
  };

  const handleReleaseBed = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId);
    if (bed && !bed.available) {
      bed.available = true;
      bed.reservedBy = undefined;
      bed.reservedAt = undefined;

      toast.success("Bed released successfully!", {
        description: `Bed ${bed.id} is now available`,
      });

      setRefresh((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedIcon className="h-6 w-6 text-primary" />
            Bed Management
          </CardTitle>
          <CardDescription>
            Real-time bed availability: {availableCount} / {totalBeds} beds available
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reserve Bed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              placeholder="Enter patient name to reserve a bed"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {beds.map((bed) => (
          <Card key={bed.id} className={!bed.available ? "bg-muted/50" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{bed.id}</h3>
                  <p className="text-sm text-muted-foreground">{bed.type}</p>
                </div>
                <Badge variant={bed.available ? "default" : "secondary"}>
                  {bed.available ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Reserved
                    </>
                  )}
                </Badge>
              </div>

              {!bed.available && bed.reservedBy && (
                <div className="mb-4 text-sm">
                  <p className="font-medium">Reserved for:</p>
                  <p className="text-muted-foreground">{bed.reservedBy}</p>
                  {bed.reservedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(bed.reservedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {bed.available ? (
                <Button
                  onClick={() => handleBookBed(bed.id)}
                  className="w-full"
                  size="sm"
                  disabled={!patientName.trim()}
                >
                  Reserve This Bed
                </Button>
              ) : (
                <Button
                  onClick={() => handleReleaseBed(bed.id)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Release Bed
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
