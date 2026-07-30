import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

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
    <Card className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Filter className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Filter Periode Waktu</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Dari Periode</Label>
          <div className="flex gap-2">
            <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Bulan Mulai" /></SelectTrigger>
              <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={startYear} onValueChange={setStartYear}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Tahun Mulai" /></SelectTrigger>
              <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Sampai Periode</Label>
          <div className="flex gap-2">
            <Select value={endMonth} onValueChange={setEndMonth}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Bulan Selesai" /></SelectTrigger>
              <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={endYear} onValueChange={setEndYear}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Tahun Selesai" /></SelectTrigger>
              <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
