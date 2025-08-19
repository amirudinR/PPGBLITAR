import React, { useMemo } from 'react';
import { Attendance, Desa, Kelompok } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceSectionProps {
  attendance: Attendance[];
  desas: Desa[];
  kelompok: Kelompok[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(String);

type Summary = {
  [desa: string]: {
    [kelompok: string]: {
      hadir: number;
      izin: number;
      tidakHadir: number;
    }
  }
};

export default function AttendanceSection({
  attendance,
  desas,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}: AttendanceSectionProps) {

  const summaryData = useMemo<Summary>(() => {
    const filtered = attendance.filter(a => {
      const date = new Date(a.date);
      return date.getFullYear().toString() === selectedYear && (date.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
    });

    return filtered.reduce<Summary>((acc, record) => {
      const { desa, kelompok, status } = record;
      if (!acc[desa]) acc[desa] = {};
      if (!acc[desa][kelompok]) acc[desa][kelompok] = { hadir: 0, izin: 0, tidakHadir: 0 };

      if (status === 'Hadir') acc[desa][kelompok].hadir++;
      else if (status === 'Izin') acc[desa][kelompok].izin++;
      else if (status === 'Tidak Hadir') acc[desa][kelompok].tidakHadir++;
      
      return acc;
    }, {});
  }, [attendance, selectedMonth, selectedYear]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran</h2>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-4">
        {desas.map(desa => {
          const desaSummary = summaryData[desa.name];
          return (
            <AccordionItem value={desa.id} key={desa.id} className="bg-white rounded-lg shadow">
              <AccordionTrigger className="px-6 text-lg font-semibold hover:no-underline">
                {desa.name}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {desaSummary ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kelompok</TableHead>
                        <TableHead className="text-center">Hadir</TableHead>
                        <TableHead className="text-center">Izin</TableHead>
                        <TableHead className="text-center">Tidak Hadir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(desaSummary).map(([kelompokName, stats]) => (
                        <TableRow key={kelompokName}>
                          <TableCell>{kelompokName}</TableCell>
                          <TableCell className="text-center">{stats.hadir}</TableCell>
                          <TableCell className="text-center">{stats.izin}</TableCell>
                          <TableCell className="text-center">{stats.tidakHadir}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada data kehadiran untuk desa ini di periode yang dipilih.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
}