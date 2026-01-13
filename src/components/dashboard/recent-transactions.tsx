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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import type { TransactionFilter } from '@/app/page';
import { formatCurrency } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Trash2, ListFilter } from 'lucide-react';
import { useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { MonthPicker } from './month-picker';


interface RecentTransactionsProps {
  transactions: Transaction[];
  activeFilter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

export function RecentTransactions({ transactions, activeFilter, setFilter, dateRange, setDateRange }: RecentTransactionsProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = (tx: Transaction) => {
    let collectionPath = '';
    if (tx.type === 'income') collectionPath = `incomes`;
    else if (tx.type === 'fuel') collectionPath = `fuel_expenses`;
    else if (tx.type === 'home' || tx.type === 'emi') collectionPath = `home_expenses`;

    if (collectionPath && firestore) {
      const docRef = doc(firestore, collectionPath, tx.id);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: "Success",
        description: "Transaction deleted.",
      });
    }
  };

  const getTransactionTypeForBadge = (tx: Transaction) => {
    if (tx.type === 'home') return 'Home';
    if (tx.type === 'fuel') return 'Fuel';
    if (tx.type === 'income') return 'Income';
    if (tx.type === 'emi') return 'EMI';
    return 'Transaction';
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of your most recent income and expenses.</CardDescription>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter Type</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={activeFilter === 'all'} onCheckedChange={() => setFilter('all')}>All</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeFilter === 'income'} onCheckedChange={() => setFilter('income')}>Income</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeFilter === 'home'} onCheckedChange={() => setFilter('home')}>Home Expense</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeFilter === 'fuel'} onCheckedChange={() => setFilter('fuel')}>Fuel Expense</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={activeFilter === 'emi'} onCheckedChange={() => setFilter('emi')}>EMI</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MonthPicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px] text-right">Actions</TableHead>
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
                    className={cn(
                      'text-xs font-medium',
                       tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
                       tx.type === 'emi' && 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
                    )}
                  >
                    {getTransactionTypeForBadge(tx)}
                  </Badge>
                </TableCell>
                 <TableCell>
                  {(tx.type === 'home' || tx.type === 'income' || tx.type === 'emi') && tx.category}
                  {tx.type === 'fuel' && <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Delete transaction</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this
                          transaction from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(tx)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No transactions for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
