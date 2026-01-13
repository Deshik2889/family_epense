'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IncomeSchema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { Timestamp, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { INCOME_CATEGORIES } from '@/lib/constants';


type IncomeFormValues = z.infer<typeof IncomeSchema>;

interface IncomeFormProps {
  setOpen: (open: boolean) => void;
}

export function IncomeForm({ setOpen }: IncomeFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(IncomeSchema),
    defaultValues: {
      amount: undefined,
      date: new Date(),
    },
  });

  async function onSubmit(data: IncomeFormValues) {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Database not available. Please try again later.',
        });
        return;
    }
    try {
      const incomeId = uuidv4();
      const incomeDocRef = doc(firestore, `incomes/${incomeId}`);
      
      const payload = {
        id: incomeId,
        amount: data.amount,
        date: Timestamp.fromDate(data.date),
        category: data.category,
      };

      setDocumentNonBlocking(incomeDocRef, payload, { merge: true });

      toast({ title: 'Success', description: 'Income added successfully.' });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while adding income.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Received</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an income category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INCOME_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Income"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
