'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookHeart, Menu, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { IncomeForm } from '../forms/income-form';
import { ExpenseForm } from '../forms/expense-form';

export default function Header() {
  const [isIncomeOpen, setIncomeOpen] = useState(false);
  const [isExpenseOpen, setExpenseOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <BookHeart className="h-6 w-6 text-primary-foreground" />
        <span className="text-xl font-bold tracking-tight">Family Finance</span>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {/* Desktop Buttons */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Dialog open={isIncomeOpen} onOpenChange={setIncomeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Add Income</span>
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
                <span className="whitespace-nowrap">Add Expense</span>
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

        {/* Mobile Dropdown Menu */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIncomeOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Add Income</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setExpenseOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Add Expense</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/emis">Manage EMIs</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
