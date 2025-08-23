import React, { useState, useEffect, useMemo } from 'react';
import { User, Kelas, Generus, MonthlyAttendance } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMonthlyAttendance } from '@/hooks/useMonthlyAttendance';
import { Progress } from "@/components/ui/progress";

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

  const attendanceSummary = useMemo(() => {
    return monthlyAttendance.map(record => {
      const percentage = record.meetingsHeld > 0 ? (record.meetingsAttended / record.meetingsHeld) * 100 : 0;
      return {
        ...record,
        percentage: Math.round(percentage),
      };
    });
  }, [monthlyAttendance]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Kehadiran - {kelas.find(k => k.id === selectedClassId)?.namaKelas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="meetingsHeld">Jumlah Pertemuan Bulan Ini</Label>
                <Input 
                  id="meetingsHeld" 
                  type="number" 
                  value={meetingsHeld}
                  onChange={(e) => setMeetingsHeld(parseInt(e.target.value, 10) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="overflow-auto max-h-96">
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

          <Card>
            <CardHeader>
              <CardTitle>Rekap Kehadiran - {selectedMonth} {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[30rem]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="text-center">Kehadiran</TableHead>
                      <TableHead className="w-40">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={3} className="text-center">Memuat...</TableCell></TableRow>
                    ) : attendanceSummary.length > 0 ? (
                      attendanceSummary.map(record => (
                        <TableRow key={record.id}>
                          <TableCell>{record.studentName}</TableCell>
                          <TableCell className="text-center">{record.meetingsAttended}/{record.meetingsHeld}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={record.percentage} className="w-24" />
                              <span>{record.percentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} className="text-center">Belum ada data untuk periode ini.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}