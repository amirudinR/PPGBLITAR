import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface AttendanceFiltersProps {
  startMonth: string;
  setStartMonth: (month: string) => void;
  startYear: string;
  setStartYear: (year: string) => void;
  endMonth: string;
  setEndMonth: (month: string) => void;
  endYear: string;
  setEndYear: (year: string) => void;
}

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(String);

export default function AttendanceFilters({
  startMonth,
  setStartMonth,
  startYear,
  setStartYear,
  endMonth,
  setEndMonth,
  endYear,
  setEndYear
}: AttendanceFiltersProps) {
  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>Filter Periode</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dari</Label>
          <div className="flex gap-2">
            <Select value={startMonth} onValueChange={setStartMonth}><SelectTrigger><SelectValue placeholder="Bulan Mulai" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
            <Select value={startYear} onValueChange={setStartYear}><SelectTrigger><SelectValue placeholder="Tahun Mulai" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sampai</Label>
          <div className="flex gap-2">
            <Select value={endMonth} onValueChange={setEndMonth}><SelectTrigger><SelectValue placeholder="Bulan Selesai" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
            <Select value={endYear} onValueChange={setEndYear}><SelectTrigger><SelectValue placeholder="Tahun Selesai" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
