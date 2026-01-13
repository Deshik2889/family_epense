import { z } from 'zod';
import { HOME_EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';
import { Timestamp } from 'firebase/firestore';

// Schemas for form validation
export const IncomeSchema = z.object({
  amount: z.number({required_error: "Amount is required."}).positive('Amount must be positive'),
  date: z.date(),
  category: z.enum(INCOME_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category." }),
  }),
});

export const ExpenseSchema = z.object({
  amount: z.number({required_error: "Amount is required."}).positive('Amount must be positive'),
  date: z.date(),
  category: z.enum(HOME_EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category." }),
  }).optional(),
  notes: z.string().optional(),
  emiId: z.string().optional(), // To link an expense to an EMI
});


export const EmiSchema = z.object({
  emiName: z.string().min(1, 'EMI name is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  monthlyEmiAmount: z.number({required_error: "Amount is required."}).positive('Amount must be positive'),
  totalMonths: z.number({required_error: "Total months is required."}).int().positive('Must be a positive number of months'),
  startDate: z.date(),
});

// Base interface for documents from Firestore that include a date
export interface BaseDoc {
  id: string;
  date: Timestamp; // Using Firestore Timestamp
  amount: number;
}

// Specific data types that extend the base
export interface Income extends Omit<BaseDoc, 'date'> {
  date: Timestamp;
  category: typeof INCOME_CATEGORIES[number];
}

export interface FuelExpense extends Omit<BaseDoc, 'date'> {
  date: Timestamp;
}

export interface HomeExpense extends Omit<BaseDoc, 'date'> {
  date: Timestamp;
  category: typeof HOME_EXPENSE_CATEGORIES[number];
  notes?: string;
  emiId?: string;
}

// Type for EMI data
export interface Emi {
  id: string;
  emiName: string;
  vehicleType: string;
  monthlyEmiAmount: number;
  totalMonths: number;
  startDate: Timestamp; // Using Firestore Timestamp
  paidMonths: string[]; // e.g., ["2024-07", "2024-08"]
}

// A union type for transactions that can be displayed in a list.
// The 'date' here is a JS Date object, converted from a Timestamp for display.
export type Transaction = 
  | ({ id: string, amount: number, type: 'income', date: Date, category: string })
  | ({ id: string, amount: number, category: string, type: 'home', date: Date })
  | ({ id: string, amount: number, type: 'fuel', date: Date });
