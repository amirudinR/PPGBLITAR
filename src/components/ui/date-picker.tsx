import React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = 'Pilih Tanggal' }: DatePickerProps) {
  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value && date && isValid(date) ? format(date, 'dd MMMM yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date && isValid(date) ? date : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate && isValid(selectedDate)) {
              onChange(format(selectedDate, 'yyyy-MM-dd'));
            }
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
