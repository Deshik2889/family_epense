'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

import { calculateEmiProgress } from '@/lib/helpers';
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
  const { user, isUserLoading } = useUser();

  // Memoized collection references
  const incomesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/incomes`) : null, [firestore, user]);
  const fuelExpensesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/fuel_expenses`) : null, [firestore, user]);
  const homeExpensesRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/home_expenses`) : null, [firestore, user]);
  const emisRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/emis`) : null, [firestore, user]);

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


  const isLoading = isUserLoading || incomesLoading || fuelLoading || homeLoading || emisLoading || recentIncomesLoading || recentHomeExpensesLoading || recentFuelExpensesLoading;

  const {
    totalIncome,
    totalFuelExpenses,
    totalHomeExpenses,
    totalEmiPaid,
    netBalance,
    allTransactions,
    mappedIncomes,
    mappedHomeExpenses,
    mappedFuelExpenses,
  } = useMemo(() => {
    if (!incomes || !fuelExpenses || !homeExpenses || !emis || !recentIncomes || !recentHomeExpenses || !recentFuelExpenses) {
      return { totalIncome: 0, totalFuelExpenses: 0, totalHomeExpenses: 0, totalEmiPaid: 0, netBalance: 0, allTransactions: [], mappedIncomes: [], mappedHomeExpenses: [], mappedFuelExpenses: [] };
    }

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalFuelExpenses = fuelExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalHomeExpenses = homeExpenses.reduce((sum, item) => sum + item.amount, 0);

    const totalEmiPaid = emis.reduce((sum, emi) => {
      const emiWithDate = { ...emi, startDate: emi.startDate.toDate() };
      const progress = calculateEmiProgress(emiWithDate);
      return sum + progress.totalPaid;
    }, 0);

    const netBalance = totalIncome - totalFuelExpenses - totalHomeExpenses - totalEmiPaid;
    
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
        {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[108px] w-full" />)}
            </div>
        ) : (
            <StatCards
            totalIncome={totalIncome}
            totalFuelExpenses={totalFuelExpenses}
            totalHomeExpenses={totalHomeExpenses}
            totalEmiPaid={totalEmiPaid}
            netBalance={netBalance}
            />
        )}
        <div className="grid grid-cols-1 gap-4 lg:gap-8">
            {isLoading ? (
                <>
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[350px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </>
            ): (
                <>
                <div className="grid grid-cols-1 gap-4 lg:gap-8">
                    <Charts
                        incomes={mappedIncomes}
                        homeExpenses={mappedHomeExpenses}
                        fuelExpenses={mappedFuelExpenses}
                    />
                </div>
                <div>
                    <RecentTransactions
                        transactions={allTransactions.slice(0, 10)}
                    />
                </div>
                </>
            )}
        </div>
      </main>
    </div>
  );
}
