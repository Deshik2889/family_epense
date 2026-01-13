import {
  getIncome,
  getFuelExpenses,
  getHomeExpenses,
  getEmis,
} from '@/lib/actions';
import { calculateEmiProgress } from '@/lib/helpers';
import Header from '@/components/layout/header';
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

export default async function Dashboard() {
  const [incomes, fuelExpenses, homeExpenses, emis] = await Promise.all([
    getIncome(),
    getFuelExpenses(),
    getHomeExpenses(),
    getEmis(),
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalFuelExpenses = fuelExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalHomeExpenses = homeExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalEmiPaid = emis.reduce((sum, emi) => {
    const progress = calculateEmiProgress(emi);
    return sum + progress.totalPaid;
  }, 0);

  const netBalance =
    totalIncome - totalFuelExpenses - totalHomeExpenses - totalEmiPaid;

  const allTransactions: Transaction[] = [
    ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ...homeExpenses.map((h) => ({ ...h, type: 'home' as const })),
    ...fuelExpenses.map((f) => ({ ...f, type: 'fuel' as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <StatCards
          totalIncome={totalIncome}
          totalFuelExpenses={totalFuelExpenses}
          totalHomeExpenses={totalHomeExpenses}
          totalEmiPaid={totalEmiPaid}
          netBalance={netBalance}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Charts
            incomes={incomes as Income[]}
            homeExpenses={homeExpenses as HomeExpense[]}
            fuelExpenses={fuelExpenses as FuelExpense[]}
          />
          <RecentTransactions
            transactions={allTransactions.slice(0, 10)}
          />
        </div>
      </main>
    </div>
  );
}
