import React, { useState, useMemo } from 'react';
import { MonthlyAttendance, Desa, Kelompok, Kelas, User } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

interface StudentAttendanceRecapSectionProps {
  attendance: MonthlyAttendance[];
  desas: Desa[];
  kelompok: Kelompok[];
  kelas: Kelas[];
  currentUser: User | null;
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
const monthMap = Object.fromEntries(months.map(m => [m.label, m.value]));
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(String);

export default function StudentAttendanceRecapSection({
  attendance, desas, kelompok, kelas, currentUser,
  startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear
}: StudentAttendanceRecapSectionProps) {
  const [selectedDesa, setSelectedDesa] = useState(currentUser?.role === 'desa' || currentUser?.role === 'kelompok' ? currentUser.desa || '' : '');
  const [selectedKelompok, setSelectedKelompok] = useState(currentUser?.role === 'kelompok' ? currentUser.kelompok || '' : '');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; id: string } | null>(null);

  const filteredKelompok = useMemo(() => {
    if (!selectedDesa) return kelompok;
    return kelompok.filter(k => k.desaName === selectedDesa);
  }, [selectedDesa, kelompok]);

  const filteredKelas = useMemo(() => {
    if (!selectedKelompok) return kelas.filter(k => k.desa === selectedDesa);
    return kelas.filter(k => k.kelompok === selectedKelompok);
  }, [selectedKelompok, selectedDesa, kelas]);

  const filteredAttendance = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);
    return attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum &&
             (!selectedDesa || a.desa === selectedDesa) &&
             (!selectedKelompok || a.kelompok === selectedKelompok) &&
             (!selectedKelas || a.classId === selectedKelas);
    });
  }, [attendance, startMonth, startYear, endMonth, endYear, selectedDesa, selectedKelompok, selectedKelas]);

  const studentRecap = useMemo(() => {
    const recap: { [studentId: string]: { name: string; classId: string; attended: number; held: number } } = {};
    for (const record of filteredAttendance) {
      if (!recap[record.studentId]) {
        recap[record.studentId] = { name: record.studentName, classId: record.classId, attended: 0, held: 0 };
      }
      recap[record.studentId].attended += record.meetingsAttended;
      recap[record.studentId].held += record.meetingsHeld;
    }
    
    const kelasMap = new Map(kelas.map(k => [k.id, k]));
    return Object.entries(recap).map(([studentId, r]) => ({
      ...r,
      studentId,
      className: kelasMap.get(r.classId)?.namaKelas || 'N/A',
      guruName: kelasMap.get(r.classId)?.guruName || 'N/A',
      percentage: r.held > 0 ? Math.round((r.attended / r.held) * 100) : 0,
    }));
  }, [filteredAttendance, kelas]);

  const studentDetailData = useMemo(() => {
    if (!selectedStudent) return [];
    return filteredAttendance
      .filter(a => a.studentId === selectedStudent.id)
      .map(record => ({
        ...record,
        percentage: record.meetingsHeld > 0 ? Math.round((record.meetingsAttended / record.meetingsHeld) * 100) : 0,
      }))
      .sort((a, b) => b.year - a.year || months.findIndex(m => m.label === a.month) - months.findIndex(m => m.label === b.month));
  }, [selectedStudent, filteredAttendance]);

  const handleViewDetails = (student: { studentId: string, name: string }) => {
    setSelectedStudent({ id: student.studentId, name: student.name });
    setIsDetailOpen(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran Per Siswa</h2>
      <Card className="mb-8">
        <CardHeader><CardTitle>Filter Data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {currentUser?.role !== 'desa' && currentUser?.role !== 'kelompok' && (
            <div className="space-y-2">
              <Label>Desa</Label>
              <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                <SelectTrigger><SelectValue placeholder="Semua Desa" /></SelectTrigger>
                <SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {currentUser?.role !== 'kelompok' && (
            <div className="space-y-2">
              <Label>Kelompok</Label>
              <Select value={selectedKelompok} onValueChange={setSelectedKelompok}>
                <SelectTrigger><SelectValue placeholder="Semua Kelompok" /></SelectTrigger>
                <SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
              <SelectContent>{filteredKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dari</Label>
            <div className="flex gap-2">
              <Select value={startMonth} onValueChange={setStartMonth}><SelectTrigger><SelectValue placeholder="Bulan" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
              <Select value={startYear} onValueChange={setStartYear}><SelectTrigger><SelectValue placeholder="Tahun" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sampai</Label>
            <div className="flex gap-2">
              <Select value={endMonth} onValueChange={setEndMonth}><SelectTrigger><SelectValue placeholder="Bulan" /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
              <Select value={endYear} onValueChange={setEndYear}><SelectTrigger><SelectValue placeholder="Tahun" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Hasil Rekapitulasi</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-center">Total Kehadiran</TableHead>
                <TableHead className="w-48">Persentase</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentRecap.map(student => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.guruName}</TableCell>
                  <TableCell className="text-center">{student.attended} / {student.held}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={student.percentage} className="w-24" /><span>{student.percentage}%</span></div></TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(student)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Kehadiran: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead className="text-center">Kehadiran</TableHead>
                  <TableHead className="w-40">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentDetailData.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.month}</TableCell>
                    <TableCell>{record.year}</TableCell>
                    <TableCell className="text-center">{record.meetingsAttended} / {record.meetingsHeld}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={record.percentage} className="w-24" />
                        <span>{record.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}