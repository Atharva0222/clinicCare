import { Invoice } from "@/types/payment";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Mail, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface InvoiceDisplayProps {
  invoice: Invoice;
  onDownload?: () => void;
  onEmail?: () => void;
}

export const InvoiceDisplay = ({ invoice, onDownload, onEmail }: InvoiceDisplayProps) => {
  const handleDownload = () => {
    toast.success("Invoice downloaded successfully");
    onDownload?.();
  };

  const handleEmail = () => {
    toast.success("Invoice sent to your email");
    onEmail?.();
  };

  const getPaymentStatusBadge = () => {
    switch (invoice.payment.status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">ClinicCare</h2>
            <p className="text-sm text-muted-foreground">Healthcare Management System</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Invoice #{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(invoice.issuedAt).toLocaleDateString()}
            </p>
            {getPaymentStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Patient Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Bill To:</h3>
            <p className="font-semibold">{invoice.patientName}</p>
            {invoice.patientEmail && <p className="text-sm">{invoice.patientEmail}</p>}
            {invoice.patientPhone && <p className="text-sm">{invoice.patientPhone}</p>}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Service Type:</h3>
            <p className="font-semibold capitalize">{invoice.serviceType}</p>
            <p className="text-sm text-muted-foreground">{invoice.serviceDescription}</p>
          </div>
        </div>

        <Separator />

        {/* Invoice Items */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-semibold">Description</th>
                <th className="text-center py-2 text-sm font-semibold">Qty</th>
                <th className="text-right py-2 text-sm font-semibold">Unit Price</th>
                <th className="text-right py-2 text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 text-sm">{item.description}</td>
                  <td className="py-3 text-center text-sm">{item.quantity}</td>
                  <td className="py-3 text-right text-sm">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right text-sm">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Tax (18% GST):</span>
            <span>₹{invoice.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₹{invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Method:</p>
              <p className="font-medium capitalize">{invoice.payment.method}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status:</p>
              <p className="font-medium capitalize">{invoice.payment.status}</p>
            </div>
            {invoice.payment.transactionId && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Transaction ID:</p>
                <p className="font-mono text-xs">{invoice.payment.transactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex-1" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleEmail} className="flex-1" variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Thank you for choosing ClinicCare. For any queries, please contact our support team.
        </p>
      </CardContent>
    </Card>
  );
};
