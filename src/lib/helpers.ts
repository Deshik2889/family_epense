interface EmiForCalc {
  startDate: Date;
  totalMonths: number;
  monthlyEmiAmount: number;
  paidMonths: string[]; // Array of "YYYY-MM"
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEmiProgress(emi: EmiForCalc) {
  const paidMonthsCount = emi.paidMonths?.length || 0;
  const remainingMonths = emi.totalMonths - paidMonthsCount;
  const totalPaid = paidMonthsCount * emi.monthlyEmiAmount;
  const totalAmount = emi.totalMonths * emi.monthlyEmiAmount;
  const remainingAmount = totalAmount - totalPaid;
  const progressPercentage = (paidMonthsCount / emi.totalMonths) * 100;

  return {
    paidMonthsCount,
    remainingMonths,
    totalPaid,
    remainingAmount,
    progressPercentage,
    totalAmount,
  };
}
