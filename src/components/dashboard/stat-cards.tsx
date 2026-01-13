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
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';

interface StatCardsProps {
  totalIncome: number;
  totalFuelExpenses: number;
  totalHomeExpenses: number;
  totalEmiPaid: number;
  netBalance: number;
}

export default function StatCards({
  totalIncome,
  totalFuelExpenses,
  totalHomeExpenses,
  totalEmiPaid,
  netBalance,
}: StatCardsProps) {
  const stats = [
    { title: 'Total Income', value: totalIncome, icon: DollarSign, color: 'text-green-600' },
    { title: 'Net Balance / Savings', value: netBalance, icon: Wallet, color: netBalance >= 0 ? 'text-blue-600' : 'text-red-600' },
    { title: 'Home Expenses', value: totalHomeExpenses, icon: Home, color: 'text-red-600' },
    { title: 'Fuel Expenses', value: totalFuelExpenses, icon: Fuel, color: 'text-orange-600' },
    { title: 'EMI Paid', value: totalEmiPaid, icon: Landmark, color: 'text-purple-600' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title}>
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
    </div>
  );
}
