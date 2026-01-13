'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmiSchema } from '@/lib/types';
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

type EmiFormValues = z.infer<typeof EmiSchema>;

interface EmiFormProps {
  setOpen: (open: boolean) => void;
}

export function EmiForm({ setOpen }: EmiFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<EmiFormValues>({
    resolver: zodResolver(EmiSchema),
    defaultValues: {
      emiName: '',
      vehicleType: '',
      monthlyAmount: 0,
      totalMonths: 0,
      startDate: new Date(),
    },
  });

  async function onSubmit(data: EmiFormValues) {
    try {
      const emiId = uuidv4();
      const emiDocRef = doc(firestore, `emis/${emiId}`);
      
      const payload = {
        id: emiId,
        emiName: data.emiName,
        vehicleType: data.vehicleType,
        monthlyAmount: data.monthlyAmount,
        totalMonths: data.totalMonths,
        startDate: Timestamp.fromDate(data.startDate),
      };

      setDocumentNonBlocking(emiDocRef, payload, { merge: true });

      toast({ title: 'Success', description: 'EMI added successfully.' });
      setOpen(false);
      form.reset();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while adding the EMI.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="emiName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EMI Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Scooty Finance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Scooter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="monthlyAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Monthly Amount</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="3000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="totalMonths"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Total Months</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="24" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
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
            {form.formState.isSubmitting ? "Saving..." : "Save EMI"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
