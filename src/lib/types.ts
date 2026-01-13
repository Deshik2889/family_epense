import { z } from 'zod';
import { HOME_EXPENSE_CATEGORIES } from './constants';

// Schemas for form validation
export const IncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
});

export const ExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  category: z.enum(HOME_EXPENSE_CATEGORIES).optional(),
  notes: z.string().optional(),
});

export const EmiSchema = z.object({
  name: z.string().min(1, 'EMI name is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  monthlyAmount: z.number().positive('Amount must be positive'),
  totalMonths: z.number().int().positive('Must be a positive number of months'),
  startDate: z.date(),
});

// TypeScript types for data from Firestore
export interface BaseDoc {
  id: string;
  date: Date;
  amount: number;
}

export interface Income extends BaseDoc {}

export interface FuelExpense extends BaseDoc {}

export interface HomeExpense extends BaseDoc {
  category: typeof HOME_EXPENSE_CATEGORIES[number];
  notes?: string;
}

export interface Emi {
  id: string;
  name: string;
  vehicleType: string;
  monthlyAmount: number;
  totalMonths: number;
  startDate: Date;
}

export type Transaction = 
  | (Income & { type: 'income' })
  | (HomeExpense & { type: 'home' })
  | (FuelExpense & { type: 'fuel' });
