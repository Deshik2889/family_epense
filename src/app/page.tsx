'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

import HeaderClient from '@/components/layout/header-client';
import StatCards from '@/components/dashboard/stat-cards';
import { Charts } from '@/components/dashboard/charts';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import type {
  Income,
  HomeExpense,
  FuelExpense,
  Emi,
  Transaction,
} from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const firestore = useFirestore();

  // Memoized collection references
  const incomesRef = useMemoFirebase(() => collection(firestore, `incomes`), [firestore]);
  const fuelExpensesRef = useMemoFirebase(() => collection(firestore, `fuel_expenses`), [firestore]);
  const homeExpensesRef = useMemoFirebase(() => collection(firestore, `home_expenses`), [firestore]);
  const emisRef = useMemoFirebase(() => collection(firestore, `emis`), [firestore]);

  const recentIncomesQuery = useMemoFirebase(() => {
    if (!incomesRef) return null;
    return query(incomesRef, orderBy('date', 'desc'), limit(10));
  }, [incomesRef]);
  
  const recentHomeExpensesQuery = useMemoFirebase(() => {
      if (!homeExpensesRef) return null;
      return query(homeExpensesRef, orderBy('date', 'desc'), limit(10));
  }, [homeExpensesRef]);
  
  const recentFuelExpensesQuery = useMemoFirebase(() => {
      if (!fuelExpensesRef) return null;
      return query(fuelExpensesRef, orderBy('date', 'desc'), limit(10));
  }, [fuelExpensesRef]);


  // Fetching data
  const { data: incomes, isLoading: incomesLoading } = useCollection<Income>(incomesRef);
  const { data: fuelExpenses, isLoading: fuelLoading } = useCollection<FuelExpense>(fuelExpensesRef);
  const { data: homeExpenses, isLoading: homeLoading } = useCollection<HomeExpense>(homeExpensesRef);
  const { data: emis, isLoading: emisLoading } = useCollection<Emi>(emisRef);

  const { data: recentIncomes, isLoading: recentIncomesLoading } = useCollection<Income>(recentIncomesQuery);
  const { data: recentHomeExpenses, isLoading: recentHomeExpensesLoading } = useCollection<HomeExpense>(recentHomeExpensesQuery);
  const { data: recentFuelExpenses, isLoading: recentFuelExpensesLoading } = useCollection<FuelExpense>(recentFuelExpensesQuery);


  const isLoading = incomesLoading || fuelLoading || homeLoading || emisLoading || recentIncomesLoading || recentHomeExpensesLoading || recentFuelExpensesLoading;

  const {
    totalIncome,
    totalFuelExpenses,
    totalHomeExpenses,
    totalEmiPaid,
    totalExpenses,
    netBalance,
    allTransactions,
    mappedIncomes,
    mappedHomeExpenses,
    mappedFuelExpenses,
  } = useMemo(() => {
    const defaultResult = { totalIncome: 0, totalFuelExpenses: 0, totalHomeExpenses: 0, totalEmiPaid: 0, totalExpenses: 0, netBalance: 0, allTransactions: [], mappedIncomes: [], mappedHomeExpenses: [], mappedFuelExpenses: [] };
    if (!incomes || !fuelExpenses || !homeExpenses || !emis || !recentIncomes || !recentHomeExpenses || !recentFuelExpenses) {
      return defaultResult;
    }

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalFuelExpenses = fuelExpenses.reduce((sum, item) => sum + item.amount, 0);
    // Filter out EMI expenses from home expenses
    const nonEmiHomeExpenses = homeExpenses.filter(exp => exp.category !== 'EMI');
    const totalHomeExpenses = nonEmiHomeExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate total EMI paid from home expenses with 'EMI' category
    const emiPayments = homeExpenses.filter(exp => exp.category === 'EMI');
    const totalEmiPaid = emiPayments.reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpenses = totalHomeExpenses + totalFuelExpenses + totalEmiPaid;
    const netBalance = totalIncome - totalExpenses;
    
    // Combine and sort for the "Recent Transactions" list
    const allTransactions: Transaction[] = [
      ...recentIncomes.map((i) => ({ ...i, date: i.date.toDate(), type: 'income' as const })),
      ...recentHomeExpenses.map((h) => ({ ...h, date: h.date.toDate(), type: 'home' as const })),
      ...recentFuelExpenses.map((f) => ({ ...f, date: f.date.toDate(), type: 'fuel' as const })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const mappedIncomes = incomes.map(i => ({...i, date: i.date.toDate()}));
    const mappedHomeExpenses = homeExpenses.map(h => ({...h, date: h.date.toDate()}));
    const mappedFuelExpenses = fuelExpenses.map(f => ({...f, date: f.date.toDate()}));

    return {
      totalIncome,
      totalFuelExpenses,
      totalHomeExpenses,
      totalEmiPaid,
      totalExpenses,
      netBalance,
      allTransactions: allTransactions.slice(0, 10),
      mappedIncomes,
      mappedHomeExpenses,
      mappedFuelExpenses
    };

  }, [incomes, fuelExpenses, homeExpenses, emis, recentIncomes, recentHomeExpenses, recentFuelExpenses]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <HeaderClient />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[108px] w-full" />)}
              </>
          ) : (
              <StatCards
              totalIncome={totalIncome}
              totalFuelExpenses={totalFuelExpenses}
              totalHomeExpenses={totalHomeExpenses}
              totalEmiPaid={totalEmiPaid}
              totalExpenses={totalExpenses}
              netBalance={netBalance}
              />
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            {isLoading ? (
                <>
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[350px] w-full" />
                </>
            ): (
                
                <Charts
                    incomes={mappedIncomes}
                    homeExpenses={mappedHomeExpenses}
                    fuelExpenses={mappedFuelExpenses}
                />
            )}
        </div>
         <div className="grid grid-cols-1 gap-4 lg:gap-8">
             {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
             ) : (
                <RecentTransactions
                    transactions={allTransactions.slice(0, 10)}
                />
             )}
        </div>
      </main>
    </div>
  );
}
