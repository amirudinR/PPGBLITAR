import React, { useMemo } from 'react';
import { Attendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceSectionProps {
  attendance: Attendance[];
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
      izin: number;
      tidakHadir: number;
    }
  }
};

type KelompokSummary = {
  [jenjang: string]: {
    hadir: number;
    izin: number;
    tidakHadir: number;
  }
};

export default function AttendanceSection({
  attendance,
  desas,
  generusData,
  startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear,
  currentUser
}: AttendanceSectionProps) {

  const isKelompokRole = currentUser?.role === 'kelompok';

  const summaryData = useMemo(() => {
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth), 0);

    const filtered = attendance.filter(a => {
      const recordDate = new Date(a.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (isKelompokRole) {
      return filtered.reduce<KelompokSummary>((acc, record) => {
        if (record.kelompok !== currentUser?.kelompok) return acc;
        
        const student = generusData.find(g => g.name === record.studentName);
        if (!student) return acc;

        const jenjang = getJenjangUsia(student.pendidikan);
        if (jenjang === '-') return acc;

        if (!acc[jenjang]) acc[jenjang] = { hadir: 0, izin: 0, tidakHadir: 0 };

        if (record.status === 'Hadir') acc[jenjang].hadir++;
        else if (record.status === 'Izin') acc[jenjang].izin++;
        else if (record.status === 'Tidak Hadir') acc[jenjang].tidakHadir++;
        
        return acc;
      }, {});
    }

    return filtered.reduce<AdminSummary>((acc, record) => {
      const student = generusData.find(g => g.name === record.studentName);
      if (!student) return acc;

      const jenjang = getJenjangUsia(student.pendidikan);
      if (jenjang === '-') return acc;
      
      const { desa, status } = record;

      if (!acc[desa]) acc[desa] = {};
      if (!acc[desa][jenjang]) acc[desa][jenjang] = { hadir: 0, izin: 0, tidakHadir: 0 };

      if (status === 'Hadir') acc[desa][jenjang].hadir++;
      else if (status === 'Izin') acc[desa][jenjang].izin++;
      else if (status === 'Tidak Hadir') acc[desa][jenjang].tidakHadir++;
      
      return acc;
    }, {});
  }, [attendance, generusData, startMonth, startYear, endMonth, endYear, isKelompokRole, currentUser]);

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
                      <TableHead className="text-center">Izin</TableHead>
                      <TableHead className="text-center">Tidak Hadir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(desaSummary).map(([jenjang, stats]) => (
                      <TableRow key={jenjang}>
                        <TableCell>{jenjang}</TableCell>
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
                <TableHead className="text-center">Izin</TableHead>
                <TableHead className="text-center">Tidak Hadir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {JENJANG_USIA_LIST.map(jenjang => {
                const stats = kelompokSummary[jenjang] || { hadir: 0, izin: 0, tidakHadir: 0 };
                return (
                  <TableRow key={jenjang}>
                    <TableCell>{jenjang}</TableCell>
                    <TableCell className="text-center">{stats.hadir}</TableCell>
                    <TableCell className="text-center">{stats.izin}</TableCell>
                    <TableCell className="text-center">{stats.tidakHadir}</TableCell>
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