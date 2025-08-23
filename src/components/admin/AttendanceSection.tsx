import React, { useMemo, useState } from 'react';
import { MonthlyAttendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST, Kelas } from '@/types/admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type ClassSummary = {
  classId: string;
  className: string;
  guruName: string;
  attended: number;
  held: number;
  percentage: number;
};

type JenjangSummary = {
  classes: ClassSummary[];
  totalAttended: number;
  totalHeld: number;
  averagePercentage: number;
};

type DesaSummary = {
  [jenjang: string]: JenjangSummary;
};

export default function AttendanceSection({
  attendance, desas, generusData, kelas, startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear, currentUser
}: AttendanceSectionProps) {

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Kelas | null>(null);

  const isKelompokRole = currentUser?.role === 'kelompok';

  const filteredAttendance = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);
    return attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
    });
  }, [attendance, startMonth, startYear, endMonth, endYear]);

  const summaryData = useMemo(() => {
    const classStats: { [classId: string]: { attended: number; held: number } } = {};
    filteredAttendance.forEach(record => {
      if (!classStats[record.classId]) classStats[record.classId] = { attended: 0, held: 0 };
      classStats[record.classId].attended += record.meetingsAttended;
      classStats[record.classId].held += record.meetingsHeld;
    });

    if (isKelompokRole) return classStats;

    const adminSummary: Record<string, DesaSummary> = {};
    kelas.forEach(k => {
      const stats = classStats[k.id] || { attended: 0, held: 0 };
      if (!adminSummary[k.desa]) adminSummary[k.desa] = {};
      if (!adminSummary[k.desa][k.jenjangUsia]) {
        adminSummary[k.desa][k.jenjangUsia] = { classes: [], totalAttended: 0, totalHeld: 0, averagePercentage: 0 };
      }
      
      const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
      adminSummary[k.desa][k.jenjangUsia].classes.push({
        classId: k.id,
        className: k.namaKelas,
        guruName: k.guruName,
        ...stats,
        percentage,
      });
    });

    Object.values(adminSummary).forEach(desa => {
      Object.values(desa).forEach(jenjang => {
        jenjang.totalAttended = jenjang.classes.reduce((sum, c) => sum + c.attended, 0);
        jenjang.totalHeld = jenjang.classes.reduce((sum, c) => sum + c.held, 0);
        jenjang.averagePercentage = jenjang.totalHeld > 0 ? Math.round((jenjang.totalAttended / jenjang.totalHeld) * 100) : 0;
      });
    });

    return adminSummary;
  }, [filteredAttendance, kelas, isKelompokRole]);

  const detailData = useMemo(() => {
    if (!selectedClass) return [];
    const studentSummary: { [studentId: string]: { name: string, attended: number, held: number } } = {};
    const attendanceForClass = filteredAttendance.filter(a => a.classId === selectedClass.id);
    attendanceForClass.forEach(record => {
      if (!studentSummary[record.studentId]) studentSummary[record.studentId] = { name: record.studentName, attended: 0, held: 0 };
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
        const desaSummary = (summaryData as Record<string, DesaSummary>)[desa.name] || {};
        return (
          <AccordionItem value={desa.id} key={desa.id} className="bg-white rounded-lg shadow">
            <AccordionTrigger className="px-6 text-lg font-semibold hover:no-underline">{desa.name}</AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Accordion type="multiple" className="w-full space-y-2">
                {JENJANG_USIA_LIST.map(jenjang => {
                  const jenjangData = desaSummary[jenjang];
                  if (!jenjangData || jenjangData.classes.length === 0) return null;
                  return (
                    <AccordionItem value={jenjang} key={jenjang} className="border rounded-md">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex justify-between w-full items-center pr-4">
                          <span>{jenjang}</span>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Rata-rata:</span>
                            <Progress value={jenjangData.averagePercentage} className="w-24" />
                            <span>{jenjangData.averagePercentage}%</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-2">
                        <Table>
                          <TableHeader><TableRow><TableHead>Kelas</TableHead><TableHead>Guru</TableHead><TableHead className="text-center">Kehadiran</TableHead><TableHead className="w-40">Persentase</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {jenjangData.classes.map(c => (
                              <TableRow key={c.classId}>
                                <TableCell>{c.className}</TableCell>
                                <TableCell>{c.guruName}</TableCell>
                                <TableCell className="text-center">{c.attended} / {c.held}</TableCell>
                                <TableCell><div className="flex items-center gap-2"><Progress value={c.percentage} className="w-24" /><span>{c.percentage}%</span></div></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  );

  const renderKelompokView = () => {
    const kelompokSummary = summaryData as { [classId: string]: { attended: number; held: number } };
    const userKelompok = currentUser?.kelompok;
    const classesInKelompok = kelas.filter(k => k.kelompok === userKelompok);

    return (
      <Card className="bg-white rounded-lg shadow">
        <CardHeader><CardTitle>Rekap Kehadiran Kelompok: {userKelompok}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nama Kelas</TableHead><TableHead>Nama Guru</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {classesInKelompok.map(k => {
                const stats = kelompokSummary[k.id] || { attended: 0, held: 0 };
                const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                return (
                  <TableRow key={k.id}>
                    <TableCell>{k.namaKelas}</TableCell>
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
      {isKelompokRole ? renderKelompokView() : renderAdminDesaView()}

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