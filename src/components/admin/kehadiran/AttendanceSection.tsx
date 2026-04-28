import React, { useMemo, useState } from 'react';
import { MonthlyAttendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST, Kelas } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AttendanceSectionProps {
  attendance: MonthlyAttendance[];
  desas: Desa[];
  generusData: Generus[];
  kelas: Kelas[];
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
  attendance, desas, generusData, kelas, startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear, currentUser
}: AttendanceSectionProps) {

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Kelas | null>(null);

  const isRestrictedRole = currentUser?.role === 'kelompok' || currentUser?.role === 'guru';

  const filteredAttendance = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);
    return attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
    });
  }, [attendance, startMonth, startYear, endMonth, endYear]);

  const summaryData = useMemo(() => {
    const generusMap = new Map(generusData.map(g => [g.id, g]));

    if (isRestrictedRole) {
      const restrictedSummary: SummaryData = {};
      filteredAttendance.forEach(record => {
        if (!restrictedSummary[record.classId]) {
          restrictedSummary[record.classId] = { attended: 0, held: 0 };
        }
        restrictedSummary[record.classId].attended += record.meetingsAttended;
        restrictedSummary[record.classId].held += record.meetingsHeld;
      });
      return restrictedSummary;
    }

    // Admin/Desa view
    const adminSummary: Record<string, SummaryData> = {};
    filteredAttendance.forEach(record => {
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

  }, [filteredAttendance, generusData, isRestrictedRole]);

  const jenjangUsiaSummary = useMemo(() => {
    if (currentUser?.role !== 'kelompok') return [];

    const summary: { [key: string]: { attended: number; held: number } } = {};
    JENJANG_USIA_LIST.forEach(j => {
      summary[j] = { attended: 0, held: 0 };
    });

    const kelasMap = new Map(kelas.map(k => [k.id, k.jenjangUsia]));

    filteredAttendance.forEach(record => {
      const jenjang = kelasMap.get(record.classId);
      if (jenjang && summary[jenjang]) {
        summary[jenjang].attended += record.meetingsAttended;
        summary[jenjang].held += record.meetingsHeld;
      }
    });

    return Object.entries(summary).map(([name, stats]) => ({
      name,
      ...stats,
      percentage: stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0,
    }));
  }, [filteredAttendance, kelas, currentUser]);

  const detailData = useMemo(() => {
    if (!selectedClass) return [];
    const studentSummary: { [studentId: string]: { name: string, attended: number, held: number } } = {};
    
    const attendanceForClass = filteredAttendance.filter(a => a.classId === selectedClass.id);
    
    attendanceForClass.forEach(record => {
      if (!studentSummary[record.studentId]) {
        studentSummary[record.studentId] = { name: record.studentName, attended: 0, held: 0 };
      }
      studentSummary[record.studentId].attended += record.meetingsAttended;
      studentSummary[record.studentId].held += record.meetingsHeld;
    });

    return Object.values(studentSummary);
  }, [selectedClass, filteredAttendance]);

  const handleViewDetails = (k: Kelas) => {
    setSelectedClass(k);
    setIsDetailOpen(true);
  };

  const renderAdminDesaView = () => (
    <Accordion type="multiple" className="w-full space-y-4">
      {desas.map(desa => {
        const desaSummary = (summaryData as Record<string, SummaryData>)[desa.name] || {};
        return (
          <AccordionItem value={desa.id} key={desa.id} className="bg-card rounded-lg shadow">
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

  const renderRestrictedView = () => {
    const summary = summaryData as SummaryData;
    const classesForUser = kelas; // Data 'kelas' sudah difilter oleh hook
    const viewTitle = currentUser?.role === 'kelompok' 
      ? `Rekap Kehadiran Kelompok: ${currentUser.kelompok}` 
      : 'Rekap Kehadiran Kelas Saya';

    return (
      <Card className="bg-card rounded-lg shadow">
        <CardHeader><CardTitle>{viewTitle}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nama Kelas</TableHead><TableHead>Jenjang Usia</TableHead><TableHead>Nama Guru</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {classesForUser.map(k => {
                const stats = summary[k.id] || { attended: 0, held: 0 };
                const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                return (
                  <TableRow key={k.id}>
                    <TableCell>{k.namaKelas}</TableCell>
                    <TableCell>{k.jenjangUsia}</TableCell>
                    <TableCell>{k.guruName}</TableCell>
                    <TableCell className="text-center">{stats.attended} / {stats.held}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Progress value={percentage} className="w-24" /><span>{percentage}%</span></div></TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(k)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </TableCell>
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
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran Per Kelas</h2>
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

      {currentUser?.role === 'kelompok' && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Rata-rata Kehadiran per Jenjang Usia</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenjang Usia</TableHead>
                  <TableHead className="text-center">Total Kehadiran</TableHead>
                  <TableHead className="w-48">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jenjangUsiaSummary.map(summary => (
                  <TableRow key={summary.name}>
                    <TableCell>{summary.name}</TableCell>
                    <TableCell className="text-center">{summary.attended} / {summary.held}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={summary.percentage} className="w-24" />
                        <span>{summary.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isRestrictedRole ? renderRestrictedView() : renderAdminDesaView()}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Kehadiran Kelas: {selectedClass?.namaKelas}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead className="text-center">Total Kehadiran</TableHead>
                  <TableHead className="w-40">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailData.map(student => {
                  const percentage = student.held > 0 ? Math.round((student.attended / student.held) * 100) : 0;
                  return (
                    <TableRow key={student.name}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-center">{student.attended} / {student.held}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-24" />
                          <span>{percentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}