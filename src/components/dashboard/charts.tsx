'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Income, HomeExpense, FuelExpense } from '@/lib/types';
import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/helpers';

interface ChartsProps {
  incomes: (Omit<Income, 'date'> & { date: Date })[];
  homeExpenses: (Omit<HomeExpense, 'date'> & { date: Date })[];
  fuelExpenses: (Omit<FuelExpense, 'date'> & { date: Date })[];
}

export function Charts({ incomes, homeExpenses, fuelExpenses }: ChartsProps) {
  const monthlyData = useMemo(() => {
    const data: { [key: string]: { month: string; income: number; expense: number } } = {};

    incomes.forEach(item => {
      const monthKey = format(startOfMonth(item.date), 'yyyy-MM');
      if (!data[monthKey]) {
        data[monthKey] = { month: format(startOfMonth(item.date), 'MMM'), income: 0, expense: 0 };
      }
      data[monthKey].income += item.amount;
    });

    [...homeExpenses, ...fuelExpenses].forEach((item) => {
      const monthKey = format(startOfMonth(item.date), 'yyyy-MM');
      if (!data[monthKey]) {
        data[monthKey] = { month: format(startOfMonth(item.date), 'MMM'), income: 0, expense: 0 };
      }
      data[monthKey].expense += item.amount;
    });
    
    // Sort keys to get the latest months, then take the last 6
    const sortedMonthKeys = Object.keys(data).sort().slice(-6);

    return sortedMonthKeys.map(key => data[key]);
  }, [incomes, homeExpenses, fuelExpenses]);

  const expenseBreakdown = useMemo(() => {
    const data: { name: string; value: number; fill: string }[] = [];

    const homeByCategory: { [key: string]: number } = {};
    // Exclude 'EMI' from the pie chart breakdown
    homeExpenses.filter(exp => exp.category !== 'EMI').forEach((exp) => {
      homeByCategory[exp.category] = (homeByCategory[exp.category] || 0) + exp.amount;
    });

    Object.entries(homeByCategory).forEach(([name, value]) => {
      data.push({ name, value, fill: `hsl(var(--chart-${(data.length % 5) + 1}))` });
    });

    const totalFuel = fuelExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    if(totalFuel > 0) {
        data.push({ name: 'Fuel', value: totalFuel, fill: 'hsl(var(--chart-3))' });
    }

    // Add EMI payments as their own category
    const totalEmi = homeExpenses
        .filter(exp => exp.category === 'EMI')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    if (totalEmi > 0) {
        data.push({ name: 'EMI', value: totalEmi, fill: 'hsl(var(--chart-5))' });
    }

    return data.sort((a,b) => b.value - a.value);
  }, [homeExpenses, fuelExpenses]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const chartConfig = {
    income: {
      label: 'Income',
      color: 'hsl(var(--chart-1))',
    },
    expense: {
      label: 'Expense',
      color: 'hsl(var(--chart-2))',
    },
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Income vs. Expenses for the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart accessibilityLayer data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis tickFormatter={(value) => formatCurrency(Number(value) / 1000) + 'k'} />
                <ChartTooltip
                  content={<ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                  />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>A look at where the money goes.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            {expenseBreakdown.length > 0 ? (
          <ChartContainer config={{}} className="h-[250px] w-full max-w-[250px]">
             <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                <ChartTooltip
                    content={<ChartTooltipContent
                    nameKey="name"
                    formatter={(value) => `${formatCurrency(value as number)}`}
                    />}
                />
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="[&_.recharts-legend-item]:w-full [&_.recharts-legend-item>span]:w-full [&_.recharts-legend-item>span]:truncate"
                />
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No expense data available.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
