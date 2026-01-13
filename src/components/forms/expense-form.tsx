'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExpenseSchema } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { HOME_EXPENSE_CATEGORIES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, setDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Timestamp, doc, arrayUnion, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { Emi } from '@/lib/types';

const FormSchema = ExpenseSchema.extend({
  expenseType: z.enum(['fuel', 'home'], {
    required_error: 'You need to select an expense type.',
  }),
});
type ExpenseFormValues = z.infer<typeof FormSchema>;

interface ExpenseFormProps {
  setOpen: (open: boolean) => void;
}

export function ExpenseForm({ setOpen }: ExpenseFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const emisRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, `emis`);
  }, [firestore]);
  const { data: emis } = useCollection<Emi>(emisRef);
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: undefined,
      date: new Date(),
      expenseType: 'home',
    },
  });
  
  const expenseType = form.watch('expenseType');
  const expenseCategory = form.watch('category');

  // When category changes, if it's not EMI, clear the emiId
  useEffect(() => {
    if (expenseCategory !== 'EMI') {
      form.setValue('emiId', undefined);
    }
  }, [expenseCategory, form]);

  async function onSubmit(data: ExpenseFormValues) {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Database not available. Please try again later.',
        });
        return;
    }
    try {
        const expenseId = uuidv4();
        let docRef;
        let payload:any = {
            id: expenseId,
            amount: data.amount,
            date: Timestamp.fromDate(data.date),
        };

        if (data.expenseType === 'fuel') {
            docRef = doc(firestore, `fuel_expenses/${expenseId}`);
        } else {
            docRef = doc(firestore, `home_expenses/${expenseId}`);
            payload.category = data.category;
            payload.notes = data.notes || '';
            if (data.category === 'EMI' && data.emiId) {
                payload.emiId = data.emiId;
            }
        }
        
        setDocumentNonBlocking(docRef, payload, { merge: true });

        // If it's an EMI payment, also update the EMI document
        if (data.category === 'EMI' && data.emiId) {
            const emiDocRef = doc(firestore, `emis/${data.emiId}`);
            const monthStr = format(data.date, 'yyyy-MM');
            updateDocumentNonBlocking(emiDocRef, {
                paidMonths: arrayUnion(monthStr)
            });
        }

        toast({ title: 'Success', description: 'Expense added successfully.' });
        setOpen(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Something went wrong while adding the expense.',
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expenseType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Expense Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="home" />
                    </FormControl>
                    <FormLabel className="font-normal">Home</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fuel" />
                    </FormControl>
                    <FormLabel className="font-normal">Fuel</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                <FormLabel className='mb-1.5'>Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={'outline'}
                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {expenseType === 'home' && (
          <>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOME_EXPENSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {expenseCategory === 'EMI' && (
               <FormField
                control={form.control}
                name="emiId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Which EMI?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select the EMI that was paid" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {emis?.map(emi => (
                            <SelectItem key={emi.id} value={emi.id}>{emi.emiName}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Monthly grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
