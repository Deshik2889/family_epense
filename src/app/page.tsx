'use client';

import { useState, useMemo, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

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
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

export type TransactionFilter = 'all' | 'income' | 'home' | 'fuel' | 'emi';

export default function Dashboard() {
  const firestore = useFirestore();
  const transactionsRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<TransactionFilter>('all');
   const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const handleFilterAndScroll = (newFilter: TransactionFilter) => {
    setFilter(newFilter);
    setTimeout(() => {
        transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // A small delay ensures the UI has started to update
  };

  // Memoized collection references
  const incomesRef = useMemoFirebase(() => collection(firestore, `incomes`), [firestore]);
  const fuelExpensesRef = useMemoFirebase(() => collection(firestore, `fuel_expenses`), [firestore]);
  const homeExpensesRef = useMemoFirebase(() => collection(firestore, `home_expenses`), [firestore]);
  const emisRef = useMemoFirebase(() => collection(firestore, `emis`), [firestore]);

  // Fetching data
  const { data: incomes, isLoading: incomesLoading } = useCollection<Income>(incomesRef);
  const { data: fuelExpenses, isLoading: fuelLoading } = useCollection<FuelExpense>(fuelExpensesRef);
  const { data: homeExpenses, isLoading: homeLoading } = useCollection<HomeExpense>(homeExpensesRef);
  const { data: emis, isLoading: emisLoading } = useCollection<Emi>(emisRef);

  const isLoading = incomesLoading || fuelLoading || homeLoading || emisLoading;

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
    if (!incomes || !fuelExpenses || !homeExpenses || !emis) {
      return defaultResult;
    }

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalFuelExpenses = fuelExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    const nonEmiHomeExpenses = homeExpenses.filter(exp => exp.category !== 'EMI');
    const totalHomeExpenses = nonEmiHomeExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    const emiPayments = homeExpenses.filter(exp => exp.category === 'EMI');
    const totalEmiPaid = emiPayments.reduce((sum, item) => sum + item.amount, 0);
    
    const totalExpenses = totalHomeExpenses + totalFuelExpenses + totalEmiPaid;
    const netBalance = totalIncome - totalExpenses;
    
    const mappedIncomes = incomes.map(i => ({...i, date: i.date.toDate()}));
    const mappedHomeExpenses = homeExpenses.map(h => ({...h, date: h.date.toDate()}));
    const mappedFuelExpenses = fuelExpenses.map(f => ({...f, date: f.date.toDate()}));

    let combinedTransactions: Transaction[] = [
      ...mappedIncomes.map((i) => ({ ...i, type: 'income' as const })),
      ...mappedHomeExpenses.map((h) => ({ ...h, type: h.category === 'EMI' ? 'emi' : ('home' as const) })),
      ...mappedFuelExpenses.map((f) => ({ ...f, type: 'fuel' as const })),
    ]

    let filteredTransactions = combinedTransactions.filter(tx => {
       const txDate = tx.date;
       const from = dateRange?.from;
       const to = dateRange?.to;
       let inDateRange = true;
       if (from && to) {
            inDateRange = txDate >= from && txDate <= to;
       } else if (from) {
            inDateRange = txDate >= from;
       } else if (to) {
            inDateRange = txDate <= to;
       }

      if (!inDateRange) return false;

      if (filter === 'all') return true;
      if (filter === 'home') return tx.type === 'home'; // Excludes EMI
      return tx.type === filter;
    });

    const allTransactions = filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      totalIncome,
      totalFuelExpenses,
      totalHomeExpenses,
      totalEmiPaid,
      totalExpenses,
      netBalance,
      allTransactions,
      mappedIncomes,
      mappedHomeExpenses,
      mappedFuelExpenses
    };

  }, [incomes, fuelExpenses, homeExpenses, emis, filter, dateRange]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <HeaderClient />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                activeFilter={filter}
                setFilter={handleFilterAndScroll}
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
         <div className="grid grid-cols-1 gap-4 lg:gap-8" ref={transactionsRef}>
             {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
             ) : (
                <RecentTransactions
                    transactions={allTransactions}
                    activeFilter={filter}
                    setFilter={setFilter}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
             )}
        </div>
      </main>
    </div>
  );
}
