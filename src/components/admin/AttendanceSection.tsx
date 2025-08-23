import React, { useMemo } from 'react';
import { MonthlyAttendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceSectionProps {
  monthlyAttendance: MonthlyAttendance[];
  desas: Desa[];
  generusData: Generus[];
  startMonth: string;
  setStartMonth: (month: string) => void;
  startYear: string;
  setStartYear: (year: string) => void;
  endMonth: string;
  setEndMonth: (month: string) => void;
  endYear: string;
  setEndYear: (year: string) => void;
  currentUser: User | null;
}

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(String);

type AdminSummary = {
  [desa: string]: {
    [jenjang: string]: {
      hadir: number;
      total: number;
    }
  }
};

type KelompokSummary = {
  [jenjang: string]: {
    hadir: number;
    total: number;
  }
};

export default function AttendanceSection({
  monthlyAttendance,
  desas,
  generusData,
  startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear,
  currentUser
}: AttendanceSectionProps) {

  const isKelompokRole = currentUser?.role === 'kelompok';

  const studentJenjangMap = useMemo(() => {
    const map = new Map<string, string>();
    generusData.forEach(g => {
      map.set(g.id, getJenjangUsia(g.pendidikan));
    });
    return map;
  }, [generusData]);

  const summaryData = useMemo(() => {
    const startPeriod = parseInt(startYear) * 12 + parseInt(startMonth);
    const endPeriod = parseInt(endYear) * 12 + parseInt(endMonth);

    const filtered = monthlyAttendance.filter(a => {
      const recordPeriod = a.year * 12 + months.findIndex(m => m.label === a.month) + 1;
      return recordPeriod >= startPeriod && recordPeriod <= endPeriod;
    });

    if (isKelompokRole) {
      return filtered.reduce<KelompokSummary>((acc, record) => {
        const jenjang = studentJenjangMap.get(record.studentId);
        if (!jenjang || jenjang === '-') return acc;

        if (!acc[jenjang]) acc[jenjang] = { hadir: 0, total: 0 };
        
        acc[jenjang].hadir += record.meetingsAttended;
        acc[jenjang].total += record.meetingsHeld;
        
        return acc;
      }, {});
    }

    return filtered.reduce<AdminSummary>((acc, record) => {
      const jenjang = studentJenjangMap.get(record.studentId);
      if (!jenjang || jenjang === '-') return acc;
      
      const { desa } = record;

      if (!acc[desa]) acc[desa] = {};
      if (!acc[desa][jenjang]) acc[desa][jenjang] = { hadir: 0, total: 0 };

      acc[desa][jenjang].hadir += record.meetingsAttended;
      acc[desa][jenjang].total += record.meetingsHeld;
      
      return acc;
    }, {});
  }, [monthlyAttendance, studentJenjangMap, startMonth, startYear, endMonth, endYear, isKelompokRole]);

  const renderAdminDesaView = () => (
    <Accordion type="multiple" className="w-full space-y-4">
      {desas.map(desa => {
        const desaSummary = (summaryData as AdminSummary)[desa.name];
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
                      <TableHead>Jenjang Usia</TableHead>
                      <TableHead className="text-center">Hadir</TableHead>
                      <TableHead className="text-center">Tidak Hadir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(desaSummary).map(([jenjang, stats]) => (
                      <TableRow key={jenjang}>
                        <TableCell>{jenjang}</TableCell>
                        <TableCell className="text-center">{stats.hadir}</TableCell>
                        <TableCell className="text-center">{stats.total - stats.hadir}</TableCell>
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
  );

  const renderKelompokView = () => {
    const kelompokSummary = summaryData as KelompokSummary;
    return (
      <Card className="bg-white rounded-lg shadow">
        <CardHeader>
          <CardTitle>Rekap Kehadiran Kelompok: {currentUser?.kelompok}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenjang Usia</TableHead>
                <TableHead className="text-center">Hadir</TableHead>
                <TableHead className="text-center">Tidak Hadir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JENJANG_USIA_LIST.map(jenjang => {
                const stats = kelompokSummary[jenjang] || { hadir: 0, total: 0 };
                return (
                  <TableRow key={jenjang}>
                    <TableCell>{jenjang}</TableCell>
                    <TableCell className="text-center">{stats.hadir}</TableCell>
                    <TableCell className="text-center">{stats.total - stats.hadir}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran</h2>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
                <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger><SelectValue placeholder="Bulan Mulai" /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger><SelectValue placeholder="Tahun Mulai" /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Select value={endMonth} onValueChange={setEndMonth}>
                    <SelectTrigger><SelectValue placeholder="Bulan Selesai" /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={endYear} onValueChange={setEndYear}>
                    <SelectTrigger><SelectValue placeholder="Tahun Selesai" /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {isKelompokRole ? renderKelompokView() : renderAdminDesaView()}
    </div>
  );
}