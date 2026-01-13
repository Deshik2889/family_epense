'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth, getYear, getMonth, setYear, setMonth } from 'date-fns';

interface MonthPickerProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

export function MonthPicker({ dateRange, setDateRange }: MonthPickerProps) {
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedMonth = dateRange?.from ? getMonth(dateRange.from) : getMonth(new Date());
  const selectedYear = dateRange?.from ? getYear(dateRange.from) : currentYear;

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(dateRange?.from || new Date(), parseInt(monthIndex, 10));
    setDateRange({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(dateRange?.from || new Date(), parseInt(year, 10));
    setDateRange({
      from: startOfMonth(newDate),
      to: endOfMonth(newDate),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedMonth.toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedYear.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="h-8 w-[80px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
