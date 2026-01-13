'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateEmiProgress, formatCurrency } from "@/lib/helpers";
import type { Emi } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirestore, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function EmiCard({ emi }: { emi: Omit<Emi, 'startDate'> & { startDate: Date } }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { 
    paidMonthsCount, 
    remainingMonths, 
    progressPercentage, 
    totalAmount,
    remainingAmount,
    totalPaid
  } = calculateEmiProgress(emi);

  const currentMonthStr = format(new Date(), "yyyy-MM");
  const isCurrentMonthPaid = emi.paidMonths?.includes(currentMonthStr);

  const handleDelete = () => {
    if (!firestore) return;
    const docRef = doc(firestore, 'emis', emi.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Success",
      description: "EMI deleted successfully.",
    });
  };

  const handlePaymentToggle = (isPaid: boolean) => {
    const docRef = doc(firestore, 'emis', emi.id);
    const updatePayload = {
      paidMonths: isPaid ? arrayUnion(currentMonthStr) : arrayRemove(currentMonthStr)
    };
    updateDocumentNonBlocking(docRef, updatePayload);
    toast({
      title: `EMI for ${format(new Date(), 'MMMM')}`,
      description: `Marked as ${isPaid ? 'paid' : 'unpaid'}.`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4 flex flex-row items-start justify-between">
        <div>
          <CardTitle>{emi.emiName}</CardTitle>
          <CardDescription>{emi.vehicleType}</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Delete EMI</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the EMI record for {emi.emiName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-foreground">{formatCurrency(emi.monthlyEmiAmount)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <div className="flex items-center space-x-2">
                <Switch 
                    id={`payment-status-${emi.id}`} 
                    checked={isCurrentMonthPaid}
                    onCheckedChange={handlePaymentToggle}
                />
                <Label htmlFor={`payment-status-${emi.id}`}>{isCurrentMonthPaid ? "Paid" : "Unpaid"}</Label>
            </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progress</span>
            <span>{paidMonthsCount} / {emi.totalMonths} months</span>
          </div>
          <Progress value={progressPercentage} aria-label={`${paidMonthsCount} of ${emi.totalMonths} months paid`} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Total Paid</p>
                <p className="font-medium">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-medium">{formatCurrency(remainingAmount)}</p>
            </div>
             <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">Months Left</p>
                <p className="font-medium">{remainingMonths}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
