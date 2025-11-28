import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { prescriptions, medicines, updateMedicineStock, addMedicineStock, getLowStockMedicines } from "@/data/pharmacyData";
import { Prescription, PrescriptionStatus } from "@/types/pharmacy";
import { Pill, Package, CheckCircle, XCircle, AlertTriangle, Plus } from "lucide-react";

const statusColors: Record<PrescriptionStatus, string> = {
  pending: "bg-warning text-warning-foreground",
  fulfilled: "bg-success text-success-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export const PharmacyDashboard = () => {
  const [, setRefresh] = useState(0);
  const [restockAmount, setRestockAmount] = useState<Record<string, string>>({});

  const handleFulfillPrescription = (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    // Check if all medicines have sufficient stock
    const insufficientStock = prescription.items.filter(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      return !medicine || medicine.stock < item.quantity;
    });

    if (insufficientStock.length > 0) {
      toast.error("Insufficient stock for some items", {
        description: `Cannot fulfill: ${insufficientStock.map(i => i.medicineName).join(", ")}`,
      });
      return;
    }

    // Update stock for all items
    prescription.items.forEach(item => {
      updateMedicineStock(item.medicineId, item.quantity);
    });

    // Update prescription status
    prescription.status = "fulfilled";
    prescription.fulfilledAt = new Date();
    prescription.fulfilledBy = "Pharmacy Staff";

    toast.success("Prescription fulfilled!", {
      description: `Prescription ${prescription.id.slice(0, 12)} completed`,
    });

    setRefresh(prev => prev + 1);
  };

  const handleCancelPrescription = (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    prescription.status = "cancelled";
    toast.success("Prescription cancelled");
    setRefresh(prev => prev + 1);
  };

  const handleRestockMedicine = (medicineId: string) => {
    const amount = parseInt(restockAmount[medicineId] || "0");
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    addMedicineStock(medicineId, amount);
    toast.success(`Restocked ${amount} ${medicine.unit} of ${medicine.name}`);
    
    setRestockAmount({ ...restockAmount, [medicineId]: "" });
    setRefresh(prev => prev + 1);
  };

  const pendingPrescriptions = prescriptions.filter(p => p.status === "pending");
  const lowStockMedicines = getLowStockMedicines();

  const renderPrescriptionCard = (prescription: Prescription) => (
    <Card key={prescription.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
            <p className="text-sm text-muted-foreground">Prescribed by: {prescription.doctorName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(prescription.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={statusColors[prescription.status]}>{prescription.status}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-sm">Medications:</h4>
          {prescription.items.map((item, idx) => {
            const medicine = medicines.find(m => m.id === item.medicineId);
            const hasStock = medicine && medicine.stock >= item.quantity;
            
            return (
              <div key={idx} className="p-3 bg-muted/50 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-sm text-muted-foreground">Dosage: {item.dosage}</p>
                    <p className="text-sm text-muted-foreground">Frequency: {item.frequency}</p>
                    <p className="text-sm text-muted-foreground">Duration: {item.duration}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={hasStock ? "default" : "destructive"}>
                      Qty: {item.quantity}
                    </Badge>
                    {medicine && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {medicine.stock}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {prescription.notes && (
          <div className="mb-4 p-3 bg-primary/5 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Notes:</span> {prescription.notes}
            </p>
          </div>
        )}

        {prescription.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleFulfillPrescription(prescription.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Fulfill Prescription
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleCancelPrescription(prescription.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {prescription.status === "fulfilled" && prescription.fulfilledAt && (
          <p className="text-sm text-muted-foreground">
            Fulfilled on: {new Date(prescription.fulfilledAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Pharmacy Dashboard
          </CardTitle>
          <CardDescription>Manage prescriptions and medicine inventory</CardDescription>
        </CardHeader>
      </Card>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <Card className="mb-6 border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-semibold">Low Stock Alert</h3>
                <p className="text-sm text-muted-foreground">
                  {lowStockMedicines.length} medicine(s) below minimum stock level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Prescriptions ({pendingPrescriptions.length} pending)
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Medicine Inventory ({medicines.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-6">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({prescriptions.filter(p => p.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="fulfilled">
                Fulfilled ({prescriptions.filter(p => p.status === "fulfilled").length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({prescriptions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingPrescriptions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No pending prescriptions
                  </CardContent>
                </Card>
              ) : (
                pendingPrescriptions.map(renderPrescriptionCard)
              )}
            </TabsContent>

            <TabsContent value="fulfilled" className="mt-6">
              {prescriptions.filter(p => p.status === "fulfilled").length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No fulfilled prescriptions
                  </CardContent>
                </Card>
              ) : (
                prescriptions.filter(p => p.status === "fulfilled").map(renderPrescriptionCard)
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No prescriptions yet
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map(renderPrescriptionCard)
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {medicines
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((medicine) => {
                const isLowStock = medicine.stock <= medicine.minStockLevel;
                
                return (
                  <Card key={medicine.id} className={isLowStock ? "border-warning" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{medicine.name}</h3>
                          <p className="text-xs text-muted-foreground">{medicine.category}</p>
                        </div>
                        {isLowStock && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Stock:</span>
                          <span className="font-medium">
                            {medicine.stock} {medicine.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Min Level:</span>
                          <span>{medicine.minStockLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span>${medicine.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`restock-${medicine.id}`} className="text-xs">
                          Restock Quantity
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`restock-${medicine.id}`}
                            type="number"
                            placeholder="Qty"
                            value={restockAmount[medicine.id] || ""}
                            onChange={(e) =>
                              setRestockAmount({ ...restockAmount, [medicine.id]: e.target.value })
                            }
                            min="1"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleRestockMedicine(medicine.id)}
                            disabled={!restockAmount[medicine.id]}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
