'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/helpers';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your most recent income and expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={tx.type === 'income' ? 'default' : 'secondary'}
                    className={tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {tx.type === 'home' ? 'Home' : tx.type === 'fuel' ? 'Fuel' : 'Income'}
                  </Badge>
                </TableCell>
                 <TableCell>
                  {tx.type === 'home' && tx.category}
                  {tx.type !== 'home' && <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
