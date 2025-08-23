import React, { useState, useMemo } from 'react';
import { MonthlyAttendance, Desa, Kelompok, Kelas, User } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

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

  const filteredKelompok = useMemo(() => {
    if (!selectedDesa) return kelompok;
    return kelompok.filter(k => k.desaName === selectedDesa);
  }, [selectedDesa, kelompok]);

  const filteredKelas = useMemo(() => {
    if (!selectedKelompok) return kelas.filter(k => k.desa === selectedDesa);
    return kelas.filter(k => k.kelompok === selectedKelompok);
  }, [selectedKelompok, selectedDesa, kelas]);

  const studentRecap = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);

    const filteredAttendance = attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum &&
             (!selectedDesa || a.desa === selectedDesa) &&
             (!selectedKelompok || a.kelompok === selectedKelompok) &&
             (!selectedKelas || a.classId === selectedKelas);
    });

    const recap: { [studentId: string]: { name: string; classId: string; attended: number; held: number } } = {};
    for (const record of filteredAttendance) {
      if (!recap[record.studentId]) {
        recap[record.studentId] = { name: record.studentName, classId: record.classId, attended: 0, held: 0 };
      }
      recap[record.studentId].attended += record.meetingsAttended;
      recap[record.studentId].held += record.meetingsHeld;
    }
    
    const kelasMap = new Map(kelas.map(k => [k.id, k]));
    return Object.values(recap).map(r => ({
      ...r,
      className: kelasMap.get(r.classId)?.namaKelas || 'N/A',
      guruName: kelasMap.get(r.classId)?.guruName || 'N/A',
      percentage: r.held > 0 ? Math.round((r.attended / r.held) * 100) : 0,
    }));
  }, [attendance, startMonth, startYear, endMonth, endYear, selectedDesa, selectedKelompok, selectedKelas, kelas]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran Per Siswa</h2>
      <Card className="mb-8">
        <CardHeader><CardTitle>Filter Data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Desa</Label>
            <Select value={selectedDesa} onValueChange={setSelectedDesa} disabled={currentUser?.role === 'desa' || currentUser?.role === 'kelompok'}>
              <SelectTrigger><SelectValue placeholder="Semua Desa" /></SelectTrigger>
              <SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kelompok</Label>
            <Select value={selectedKelompok} onValueChange={setSelectedKelompok} disabled={currentUser?.role === 'kelompok'}>
              <SelectTrigger><SelectValue placeholder="Semua Kelompok" /></SelectTrigger>
              <SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
              <SelectContent>{filteredKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
            </Select>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentRecap.map(student => (
                <TableRow key={student.name + student.classId}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.guruName}</TableCell>
                  <TableCell className="text-center">{student.attended} / {student.held}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={student.percentage} className="w-24" /><span>{student.percentage}%</span></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}