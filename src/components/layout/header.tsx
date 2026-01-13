'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookHeart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IncomeForm } from '../forms/income-form';
import { ExpenseForm } from '../forms/expense-form';

export default function Header() {
  const [isIncomeOpen, setIncomeOpen] = useState(false);
  const [isExpenseOpen, setExpenseOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <BookHeart className="h-6 w-6 text-primary-foreground" />
        <h1 className="text-xl font-bold tracking-tight">Family Finance Tracker</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Dialog open={isIncomeOpen} onOpenChange={setIncomeOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Income</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Daily Income</DialogTitle>
              <DialogDescription>Record the income received for a specific day.</DialogDescription>
            </DialogHeader>
            <IncomeForm setOpen={setIncomeOpen} />
          </DialogContent>
        </Dialog>
        <Dialog open={isExpenseOpen} onOpenChange={setExpenseOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Expense</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Track a new fuel or household expense.</DialogDescription>
            </DialogHeader>
            <ExpenseForm setOpen={setExpenseOpen} />
          </DialogContent>
        </Dialog>
        <Button size="sm" asChild className="h-8 gap-1">
          <Link href="/emis">Manage EMIs</Link>
        </Button>
      </div>
    </header>
  );
}
