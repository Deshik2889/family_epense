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

  const recentTransactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // This is a simplified query. For a true merge of collections, you'd need more complex logic
    // or denormalize data. We will fetch from all three and combine/sort on the client.
    return {
        incomes: query(incomesRef!, orderBy('date', 'desc'), limit(10)),
        home: query(homeExpensesRef!, orderBy('date', 'desc'), limit(10)),
        fuel: query(fuelExpensesRef!, orderBy('date', 'desc'), limit(10))
    };
  }, [user, incomesRef, homeExpensesRef, fuelExpensesRef]);

  // Fetching data
  const { data: incomes, isLoading: incomesLoading } = useCollection<Income>(incomesRef);
  const { data: fuelExpenses, isLoading: fuelLoading } = useCollection<FuelExpense>(fuelExpensesRef);
  const { data: homeExpenses, isLoading: homeLoading } = useCollection<HomeExpense>(homeExpensesRef);
  const { data: emis, isLoading: emisLoading } = useCollection<Emi>(emisRef);

  const { data: recentIncomes } = useCollection<Income>(recentTransactionsQuery?.incomes);
  const { data: recentHomeExpenses } = useCollection<HomeExpense>(recentTransactionsQuery?.home);
  const { data: recentFuelExpenses } = useCollection<FuelExpense>(recentTransactionsQuery?.fuel);


  const isLoading = isUserLoading || incomesLoading || fuelLoading || homeLoading || emisLoading;

  const {
    totalIncome,
    totalFuelExpenses,
    totalHomeExpenses,
    totalEmiPaid,
    netBalance,
    allTransactions,
  } = useMemo(() => {
    if (!incomes || !fuelExpenses || !homeExpenses || !emis || !recentIncomes || !recentHomeExpenses || !recentFuelExpenses) {
      return { totalIncome: 0, totalFuelExpenses: 0, totalHomeExpenses: 0, totalEmiPaid: 0, netBalance: 0, allTransactions: [] };
    }

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalFuelExpenses = fuelExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalHomeExpenses = homeExpenses.reduce((sum, item) => sum + item.amount, 0);

    const totalEmiPaid = emis.reduce((sum, emi) => {
      const progress = calculateEmiProgress(emi);
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-8">
            {isLoading ? (
                <>
                    <Skeleton className="lg:col-span-4 h-[350px]" />
                    <Skeleton className="lg:col-span-3 h-[350px]" />
                    <Skeleton className="lg:col-span-7 h-[400px]" />
                </>
            ): (
                <>
                <div className="lg:col-span-7 grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-8">
                    <Charts
                        incomes={(incomes?.map(i => ({...i, date: i.date.toDate()})) || []) as Income[]}
                        homeExpenses={(homeExpenses?.map(h => ({...h, date: h.date.toDate()})) || []) as HomeExpense[]}
                        fuelExpenses={(fuelExpenses?.map(f => ({...f, date: f.date.toDate()})) || []) as FuelExpense[]}
                    />
                </div>
                <div className="lg:col-span-7">
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
