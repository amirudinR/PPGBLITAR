import React, { useState, useEffect, useMemo } from 'react';
import { User, Kelas, Generus, MonthlyAttendance } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMonthlyAttendance } from '@/hooks/useMonthlyAttendance';

interface MonthlyAttendanceSectionProps {
  currentUser: User | null;
  gurus: any[]; // Assuming gurus have id and userId
  kelas: Kelas[];
  generus: Generus[];
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function MonthlyAttendanceSection({ currentUser, gurus, kelas, generus }: MonthlyAttendanceSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { monthlyAttendance, loading, fetchAttendance, saveAttendanceBatch } = useMonthlyAttendance(currentUser);
  
  const [meetingsHeld, setMeetingsHeld] = useState<number>(0);
  const [studentAttendances, setStudentAttendances] = useState<Record<string, number>>({});

  const guruInfo = useMemo(() => gurus.find(g => g.userId === currentUser?.id), [gurus, currentUser]);

  const availableClasses = useMemo(() => {
    if (!guruInfo) return [];
    return kelas.filter(k => k.guruId === guruInfo.id);
  }, [kelas, guruInfo]);

  const studentsInClass = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = kelas.find(k => k.id === selectedClassId);
    if (!selectedClass || !selectedClass.studentIds) return [];
    return generus.filter(g => selectedClass.studentIds.includes(g.id));
  }, [generus, kelas, selectedClassId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendance(selectedClassId, selectedYear, selectedMonth);
    }
  }, [selectedClassId, selectedYear, selectedMonth, fetchAttendance]);

  useEffect(() => {
    if (monthlyAttendance.length > 0) {
      setMeetingsHeld(monthlyAttendance[0].meetingsHeld || 0);
      const attendances = monthlyAttendance.reduce((acc, record) => {
        acc[record.studentId] = record.meetingsAttended;
        return acc;
      }, {} as Record<string, number>);
      setStudentAttendances(attendances);
    } else {
      setMeetingsHeld(0);
      setStudentAttendances({});
    }
  }, [monthlyAttendance]);

  const handleAttendanceChange = (studentId: string, value: string) => {
    const attended = parseInt(value, 10);
    if (!isNaN(attended) && attended >= 0) {
      setStudentAttendances(prev => ({ ...prev, [studentId]: attended }));
    }
  };

  const handleSave = () => {
    const selectedClass = kelas.find(k => k.id === selectedClassId);
    if (!selectedClass) return;

    const attendanceData = studentsInClass.map(student => ({
      studentId: student.id,
      studentName: student.name,
      meetingsAttended: studentAttendances[student.id] || 0,
    }));

    saveAttendanceBatch(attendanceData, selectedClass, selectedYear, selectedMonth, meetingsHeld);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Kehadiran Generus</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pilih Kelas dan Periode</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
            <SelectContent>{availableClasses.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger><SelectValue placeholder="Pilih Bulan..." /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(y) => setSelectedYear(Number(y))}>
            <SelectTrigger><SelectValue placeholder="Pilih Tahun..." /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>Input Kehadiran - {kelas.find(k => k.id === selectedClassId)?.namaKelas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 max-w-xs">
              <Label htmlFor="meetingsHeld">Jumlah Pertemuan Bulan Ini</Label>
              <Input 
                id="meetingsHeld" 
                type="number" 
                value={meetingsHeld}
                onChange={(e) => setMeetingsHeld(parseInt(e.target.value, 10) || 0)}
                className="mt-1"
              />
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="w-48">Jumlah Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Memuat...</TableCell></TableRow>
                  ) : (
                    studentsInClass.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={studentAttendances[student.id] || ''}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            max={meetingsHeld}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Simpan Perubahan</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}