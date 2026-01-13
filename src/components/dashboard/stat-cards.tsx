import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Fuel,
  Home,
  Landmark,
  Wallet,
  ArrowDownCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { TransactionFilter } from '@/app/page';

interface StatCardsProps {
  totalIncome: number;
  totalFuelExpenses: number;
  totalHomeExpenses: number;
  totalEmiPaid: number;
  totalExpenses: number;
  netBalance: number;
  activeFilter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
}

export default function StatCards({
  totalIncome,
  totalFuelExpenses,
  totalHomeExpenses,
  totalEmiPaid,
  totalExpenses,
  netBalance,
  activeFilter,
  setFilter,
}: StatCardsProps) {
  
  const isFilterable = (filter: TransactionFilter) => {
    return ['income', 'home', 'fuel', 'emi'].includes(filter);
  };
  
  const stats = [
    { title: 'Total Income', value: totalIncome, icon: DollarSign, color: 'text-green-600', filter: 'income' as TransactionFilter },
    { title: 'Net Balance / Savings', value: netBalance, icon: Wallet, color: netBalance >= 0 ? 'text-blue-600' : 'text-red-600', filter: 'all' as TransactionFilter },
    { title: 'Total Expenses', value: totalExpenses, icon: ArrowDownCircle, color: 'text-red-600', filter: 'all' as TransactionFilter },
    { title: 'Home Expenses', value: totalHomeExpenses, icon: Home, color: 'text-orange-600', filter: 'home' as TransactionFilter },
    { title: 'Fuel Expenses', value: totalFuelExpenses, icon: Fuel, color: 'text-amber-600', filter: 'fuel' as TransactionFilter },
    { title: 'EMI Paid', value: totalEmiPaid, icon: Landmark, color: 'text-purple-600', filter: 'emi' as TransactionFilter },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.title}
          onClick={() => isFilterable(stat.filter) && setFilter(stat.filter)}
          className={cn(
            'transition-all',
            isFilterable(stat.filter) && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
            activeFilter === stat.filter && 'ring-2 ring-primary'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {formatCurrency(stat.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
