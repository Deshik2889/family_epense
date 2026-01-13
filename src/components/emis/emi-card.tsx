'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateEmiProgress, formatCurrency } from "@/lib/helpers";
import type { Emi } from "@/lib/types";

export function EmiCard({ emi }: { emi: Omit<Emi, 'startDate'> & { startDate: Date } }) {
  const { 
    paidMonths, 
    remainingMonths, 
    progressPercentage, 
    totalAmount,
    remainingAmount,
    totalPaid
  } = calculateEmiProgress(emi);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{emi.name}</CardTitle>
        <CardDescription>{emi.vehicleType}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-2xl font-bold text-primary-foreground">{formatCurrency(emi.monthlyAmount)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
        
        <div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Progress</span>
            <span>{paidMonths} / {emi.totalMonths} months</span>
          </div>
          <Progress value={progressPercentage} aria-label={`${paidMonths} of ${emi.totalMonths} months paid`} />
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
