import React, { useMemo } from 'react';
import { MonthlyAttendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AttendanceSectionProps {
  attendance: MonthlyAttendance[];
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
const monthMap = Object.fromEntries(months.map(m => [m.label, m.value]));
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(String);

type SummaryData = {
  [key: string]: { attended: number; held: number };
};

export default function AttendanceSection({
  attendance, desas, generusData, startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear, currentUser
}: AttendanceSectionProps) {

  const isKelompokRole = currentUser?.role === 'kelompok';

  const summaryData = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);

    const filtered = attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
    });

    const generusMap = new Map(generusData.map(g => [g.id, g]));

    if (isKelompokRole) {
      const kelompokSummary: SummaryData = {};
      JENJANG_USIA_LIST.forEach(j => { kelompokSummary[j] = { attended: 0, held: 0 }; });

      filtered.forEach(record => {
        const student = generusMap.get(record.studentId);
        if (student) {
          const jenjang = getJenjangUsia(student.pendidikan);
          if (jenjang !== '-' && kelompokSummary[jenjang]) {
            kelompokSummary[jenjang].attended += record.meetingsAttended;
            kelompokSummary[jenjang].held += record.meetingsHeld;
          }
        }
      });
      return kelompokSummary;
    }

    // Admin/Desa view
    const adminSummary: Record<string, SummaryData> = {};
    filtered.forEach(record => {
      const { desa } = record;
      const student = generusMap.get(record.studentId);
      if (student) {
        const jenjang = getJenjangUsia(student.pendidikan);
        if (jenjang !== '-') {
          if (!adminSummary[desa]) adminSummary[desa] = {};
          if (!adminSummary[desa][jenjang]) adminSummary[desa][jenjang] = { attended: 0, held: 0 };
          
          adminSummary[desa][jenjang].attended += record.meetingsAttended;
          adminSummary[desa][jenjang].held += record.meetingsHeld;
        }
      }
    });
    return adminSummary;

  }, [attendance, generusData, startMonth, startYear, endMonth, endYear, isKelompokRole]);

  const renderAdminDesaView = () => (
    <Accordion type="multiple" className="w-full space-y-4">
      {desas.map(desa => {
        const desaSummary = (summaryData as Record<string, SummaryData>)[desa.name] || {};
        return (
          <AccordionItem value={desa.id} key={desa.id} className="bg-white rounded-lg shadow">
            <AccordionTrigger className="px-6 text-lg font-semibold hover:no-underline">
              {desa.name}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Table>
                <TableHeader><TableRow><TableHead>Jenjang Usia</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead></TableRow></TableHeader>
                <TableBody>
                  {JENJANG_USIA_LIST.map(jenjang => {
                    const stats = desaSummary[jenjang] || { attended: 0, held: 0 };
                    const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                    return (
                      <TableRow key={jenjang}>
                        <TableCell>{jenjang}</TableCell>
                        <TableCell className="text-center">{stats.attended} / {stats.held}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Progress value={percentage} className="w-24" /><span>{percentage}%</span></div></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );

  const renderKelompokView = () => {
    const kelompokSummary = summaryData as SummaryData;
    return (
      <Card className="bg-white rounded-lg shadow">
        <CardHeader><CardTitle>Rekap Kehadiran Kelompok: {currentUser?.kelompok}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Jenjang Usia</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead></TableRow></TableHeader>
            <TableBody>
              {JENJANG_USIA_LIST.map(jenjang => {
                const stats = kelompokSummary[jenjang] || { attended: 0, held: 0 };
                const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                return (
                  <TableRow key={jenjang}>
                    <TableCell>{jenjang}</TableCell>
                    <TableCell className="text-center">{stats.attended} / {stats.held}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Progress value={percentage} className="w-24" /><span>{percentage}%</span></div></TableCell>
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
        <CardHeader><CardTitle>Filter Periode</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
                <Select value={startMonth} onValueChange={setStartMonth}><SelectTrigger><SelectValue placeholder="Bulan Mulai" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
                <Select value={startYear} onValueChange={setStartYear}><SelectTrigger><SelectValue placeholder="Tahun Mulai" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="flex gap-2">
                <Select value={endMonth} onValueChange={setEndMonth}><SelectTrigger><SelectValue placeholder="Bulan Selesai" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
                <Select value={endYear} onValueChange={setEndYear}><SelectTrigger><SelectValue placeholder="Tahun Selesai" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
        </CardContent>
      </Card>
      {isKelompokRole ? renderKelompokView() : renderAdminDesaView()}
    </div>
  );
}