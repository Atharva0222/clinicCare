import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod, PaymentDetails, PaymentStatus } from "@/types/payment";
import { CreditCard, Wallet, Banknote, Shield } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  amount: number;
  onPaymentComplete: (payment: PaymentDetails) => void;
  onCancel?: () => void;
}

export const PaymentForm = ({ amount, onPaymentComplete, onCancel }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");

  const handlePayment = async () => {
    // Validation based on payment method
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error("Please fill in all card details");
        return;
      }
      if (cardDetails.number.replace(/\s/g, "").length !== 16) {
        toast.error("Please enter a valid card number");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId) {
        toast.error("Please enter UPI ID");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment: PaymentDetails = {
      id: `pay-${Date.now()}`,
      amount,
      method: paymentMethod,
      status: "completed" as PaymentStatus,
      createdAt: new Date(),
      completedAt: new Date(),
      transactionId,
    };

    toast.success("Payment successful!", {
      description: `Transaction ID: ${transactionId.slice(0, 15)}...`,
    });

    onPaymentComplete(payment);
    setIsProcessing(false);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete your payment to confirm booking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-3xl font-bold">₹{amount.toFixed(2)}</p>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Select Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 flex-1 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Wallet className="h-4 w-4" />
                UPI
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Banknote className="h-4 w-4" />
                Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="insurance" id="insurance" />
              <Label htmlFor="insurance" className="flex items-center gap-2 flex-1 cursor-pointer">
                <Shield className="h-4 w-4" />
                Insurance
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Method Specific Forms */}
        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    number: formatCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16)),
                  })
                }
                maxLength={19}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                <Input
                  id="expiry"
                  placeholder="12/25"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    }
                    setCardDetails({ ...cardDetails, expiry: value });
                  }}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })
                  }
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        )}

        {paymentMethod === "cash" && (
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-semibold mb-1">Pay at Counter</p>
            <p className="text-muted-foreground">
              Please pay the amount at the reception counter before or after your appointment.
            </p>
          </div>
        )}

        {paymentMethod === "insurance" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceId">Insurance Policy Number</Label>
              <Input id="insuranceId" placeholder="Enter policy number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input id="insuranceProvider" placeholder="Enter insurance company name" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="flex-1" disabled={isProcessing}>
              Cancel
            </Button>
          )}
          <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Your payment information is secure and encrypted
        </p>
      </CardContent>
    </Card>
  );
};
