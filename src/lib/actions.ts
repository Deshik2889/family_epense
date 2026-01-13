// @ts-nocheck
'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
  doc,
} from 'firebase/firestore';
import { db, getUserId } from './firebase';
import {
  IncomeSchema,
  ExpenseSchema,
  EmiSchema,
  type Income,
  type FuelExpense,
  type HomeExpense,
  type Emi,
} from './types';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert Firestore docs to plain objects
function docsToObjects(docs) {
  const objects = [];
  docs.forEach((doc) => {
    const data = doc.data();
    objects.push({
      ...data,
      id: doc.id,
      date: data.date.toDate(),
      // Handle optional startDate for EMIs
      ...(data.startDate && { startDate: data.startDate.toDate() }),
    });
  });
  return objects;
}

// Income Actions
export async function addIncome(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'User not authenticated.' };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = IncomeSchema.safeParse({
    amount: parseFloat(rawData.amount as string),
    date: new Date(rawData.date as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { amount, date } = validatedFields.data;
    const incomeId = uuidv4();
    await addDoc(collection(db, `users/${userId}/incomes`), {
      id: incomeId,
      amount,
      date: Timestamp.fromDate(date),
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding income:', error);
    return { success: false, error: 'Failed to add income.' };
  }
}

export async function getIncome(): Promise<Income[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const q = query(collection(db, `users/${userId}/incomes`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return docsToObjects(querySnapshot.docs);
}

// Expense Actions
const ExpenseFormSchema = ExpenseSchema.extend({
  expenseType: z.enum(['fuel', 'home']),
});

export async function addExpense(formData: FormData) {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'User not authenticated.' };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ExpenseFormSchema.safeParse({
    amount: parseFloat(rawData.amount as string),
    date: new Date(rawData.date as string),
    expenseType: rawData.expenseType,
    category: rawData.category,
    notes: rawData.notes,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { amount, date, expenseType, category, notes } = validatedFields.data;
    const expenseId = uuidv4();
    
    if (expenseType === 'fuel') {
      await addDoc(collection(db, `users/${userId}/fuel_expenses`), {
        id: expenseId,
        amount,
        date: Timestamp.fromDate(date),
      });
    } else {
      await addDoc(collection(db, `users/${userId}/home_expenses`), {
        id: expenseId,
        amount,
        date: Timestamp.fromDate(date),
        category,
        notes: notes || '',
      });
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding expense:', error);
    return { success: false, error: 'Failed to add expense.' };
  }
}

export async function getFuelExpenses(): Promise<FuelExpense[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const q = query(collection(db, `users/${userId}/fuel_expenses`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return docsToObjects(querySnapshot.docs);
}

export async function getHomeExpenses(): Promise<HomeExpense[]> {
    const userId = await getUserId();
    if (!userId) return [];
  const q = query(collection(db, `users/${userId}/home_expenses`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return docsToObjects(querySnapshot.docs);
}

// EMI Actions
export async function addEmi(formData: FormData) {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'User not authenticated.' };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = EmiSchema.safeParse({
    name: rawData.name,
    vehicleType: rawData.vehicleType,
    monthlyAmount: parseFloat(rawData.monthlyAmount as string),
    totalMonths: parseInt(rawData.totalMonths as string, 10),
    startDate: new Date(rawData.startDate as string),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const { name, vehicleType, monthlyAmount, totalMonths, startDate } = validatedFields.data;
    const emiId = uuidv4();
    await addDoc(collection(db, `users/${userId}/emis`), {
      id: emiId,
      name,
      vehicleType,
      monthlyAmount,
      totalMonths,
      startDate: Timestamp.fromDate(startDate),
    });
    revalidatePath('/emis');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding EMI:', error);
    return { success: false, error: 'Failed to add EMI.' };
  }
}

export async function getEmis(): Promise<Emi[]> {
    const userId = await getUserId();
    if (!userId) return [];
  const querySnapshot = await getDocs(collection(db, `users/${userId}/emis`));
  return docsToObjects(querySnapshot.docs);
}
