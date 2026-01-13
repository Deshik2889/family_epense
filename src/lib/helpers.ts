import { differenceInCalendarMonths } from 'date-fns';
import type { Emi } from './types';

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEmiProgress(emi: Emi) {
  const now = new Date();
  const start = emi.startDate;
  
  let monthsPassed = differenceInCalendarMonths(now, start);

  if (now.getDate() < start.getDate()) {
    monthsPassed = Math.max(0, monthsPassed);
  } else {
    monthsPassed = Math.max(0, monthsPassed + 1);
  }
  
  const paidMonths = Math.min(monthsPassed, emi.totalMonths);
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
