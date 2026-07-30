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
import { Filter, CalendarCheck, Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface MonthlyAttendanceSectionProps {
  currentUser: User | null;
  gurus: any[];
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
    if (!guruInfo) return kelas;
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
          KEHADIRAN GENERUS
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Input & Rekap Kehadiran Kelas
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Pilih kelas dan periode bulan untuk menginput kehadiran atau meninjau persentase.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Pilih Kelas dan Periode</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Pilih Kelas</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
              <SelectContent className="rounded-2xl">{availableClasses.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Pilih Bulan</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Pilih Bulan..." /></SelectTrigger>
              <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Pilih Tahun</Label>
            <Select value={String(selectedYear)} onValueChange={(y) => setSelectedYear(Number(y))}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Pilih Tahun..." /></SelectTrigger>
              <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {!selectedClassId ? (
        <Card className="rounded-3xl border border-border/60 bg-card p-8 shadow-xs text-center">
          <EmptyState
            icon={CalendarCheck}
            title="Pilih Kelas Terlebih Dahulu"
            description="Silakan pilih salah satu kelas pada filter di atas untuk menginput atau melihat rekapitulasi kehadiran."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Attendance Card */}
          <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <CardHeader className="border-b border-border/50 px-6 py-4">
              <CardTitle className="text-base font-bold text-foreground">
                Input Kehadiran — {kelas.find(k => k.id === selectedClassId)?.namaKelas}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-1.5">
                <Label htmlFor="meetingsHeld" className="text-xs font-bold text-foreground">Jumlah Pertemuan Bulan Ini</Label>
                <Input 
                  id="meetingsHeld" 
                  type="number" 
                  value={meetingsHeld}
                  onChange={(e) => setMeetingsHeld(parseInt(e.target.value, 10) || 0)}
                  className="rounded-xl bg-background border-border/80 text-sm font-medium"
                />
              </div>

              {studentsInClass.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Belum Ada Siswa di Kelas Ini"
                  description="Kelas ini belum memiliki daftar generasi penerus yang terdaftar."
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-border/50">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="border-b border-border/60">
                          <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3">Nama Siswa</TableHead>
                          <TableHead className="w-48 text-right font-bold text-xs uppercase text-muted-foreground py-3 pr-4">Hadir (Kali)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsInClass.map(student => (
                          <TableRow key={student.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                            <TableCell className="font-semibold text-foreground text-xs py-3">{student.name}</TableCell>
                            <TableCell className="text-right py-3 pr-4">
                              <Input 
                                type="number"
                                value={studentAttendances[student.id] ?? ''}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                max={meetingsHeld}
                                className="w-24 ml-auto rounded-xl text-xs font-semibold text-center border-border/80"
                                placeholder="0"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} className="rounded-xl px-6 font-semibold shadow-md shadow-primary/20 gap-2">
                      Simpan Kehadiran
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recap Card */}
          <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <CardHeader className="border-b border-border/50 px-6 py-4">
              <CardTitle className="text-base font-bold text-foreground">
                Rekapitulasi — {selectedMonth} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {attendanceSummary.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="Belum Ada Data Rekap"
                  description="Belum ada data kehadiran yang tersimpan untuk kelas dan bulan ini."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border/50">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-b border-border/60">
                        <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3">Nama Siswa</TableHead>
                        <TableHead className="text-center font-bold text-xs uppercase text-muted-foreground py-3">Kehadiran</TableHead>
                        <TableHead className="w-36 text-right font-bold text-xs uppercase text-muted-foreground py-3 pr-4">Persentase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceSummary.map(record => (
                        <TableRow key={record.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                          <TableCell className="font-semibold text-foreground text-xs py-3.5">{record.studentName}</TableCell>
                          <TableCell className="text-center font-semibold text-xs py-3.5">{record.meetingsAttended} / {record.meetingsHeld}</TableCell>
                          <TableCell className="text-right py-3.5 pr-4">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              record.percentage >= 85
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : record.percentage >= 65
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {record.percentage}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}