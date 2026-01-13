import { differenceInCalendarMonths } from 'date-fns';

interface EmiForCalc {
  startDate: Date;
  totalMonths: number;
  monthlyAmount: number;
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
  const now = new Date();
  const start = emi.startDate;
  
  let monthsPassed = differenceInCalendarMonths(now, start);

  // This logic is tricky. Let's simplify. If we are in the same month, but before the start day, 0 months passed.
  // If we are past the start day, 1 month has passed.
  if (now.getFullYear() === start.getFullYear() && now.getMonth() === start.getMonth() && now.getDate() < start.getDate()) {
      monthsPassed = 0;
  } else if (monthsPassed >= 0) {
      // differenceInCalendarMonths can be off by one depending on the day of the month.
      // A simpler approach might just be to count the months.
      monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (now.getDate() >= start.getDate()) {
          monthsPassed += 1;
      }
  }

  const paidMonths = Math.min(Math.max(0, monthsPassed), emi.totalMonths);
  const remainingMonths = emi.totalMonths - paidMonths;
  const totalPaid = paidMonths * emi.monthlyAmount;
  const totalAmount = emi.totalMonths * emi.monthlyAmount;
  const remainingAmount = totalAmount - totalPaid;
  const progressPercentage = (paidMonths / emi.totalMonths) * 100;

  return {
    paidMonths,
    remainingMonths,
    totalPaid,
    remainingAmount,
    progressPercentage,
    totalAmount,
  };
}
