import React, { useState, useMemo } from 'react';
import { MonthlyAttendance, Desa, Kelompok, Kelas, User } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Users, Filter, RotateCcw } from 'lucide-react';
import PaginationControls from '../layout/PaginationControls';
import { EmptyState } from '@/components/ui/empty-state';

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

const ITEMS_PER_PAGE = 10;

export default function StudentAttendanceRecapSection({
  attendance, desas, kelompok, kelas, currentUser,
  startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear
}: StudentAttendanceRecapSectionProps) {
  const isGuruRole = currentUser?.role === 'guru';
  
  const [selectedDesa, setSelectedDesa] = useState(currentUser?.role === 'desa' || isGuruRole ? currentUser.desa || '' : '');
  const [selectedKelompok, setSelectedKelompok] = useState(currentUser?.role === 'kelompok' || isGuruRole ? currentUser.kelompok || '' : '');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; id: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleResetFilters = () => {
    if (!isGuruRole && currentUser?.role !== 'desa') setSelectedDesa('');
    if (!isGuruRole && currentUser?.role !== 'kelompok') setSelectedKelompok('');
    setSelectedKelas('');
    setCurrentPage(1);
  };

  const filteredKelompok = useMemo(() => {
    if (!selectedDesa) return kelompok;
    return kelompok.filter(k => k.desaName === selectedDesa);
  }, [selectedDesa, kelompok]);

  const filteredKelas = useMemo(() => {
    if (isGuruRole) return kelas;
    if (!selectedKelompok) return kelas.filter(k => k.desa === selectedDesa);
    return kelas.filter(k => k.kelompok === selectedKelompok);
  }, [selectedKelompok, selectedDesa, kelas, isGuruRole]);

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

  const sortedStudentRecap = useMemo(() => {
    let sortableItems = [...studentRecap];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [studentRecap, sortConfig]);

  const paginatedStudentRecap = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedStudentRecap.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedStudentRecap, currentPage]);

  const totalPages = Math.ceil(sortedStudentRecap.length / ITEMS_PER_PAGE);

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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
          KEHADIRAN GENERUS
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Rekap Kehadiran Per Siswa
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Pantau tingkat kehadiran setiap generasi penerus berdasarkan filter kelas dan periode.
        </p>
      </div>

      <Card className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Filter className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Filter Data & Periode</h3>
          </div>
          {(selectedKelas || selectedDesa || selectedKelompok) && (
            <Button onClick={handleResetFilters} variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {!isGuruRole && currentUser?.role !== 'desa' && currentUser?.role !== 'kelompok' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Desa</Label>
              <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Semua Desa" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {!isGuruRole && currentUser?.role !== 'kelompok' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Kelompok</Label>
              <Select value={selectedKelompok} onValueChange={setSelectedKelompok}>
                <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Semua Kelompok" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Kelas</Label>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Semua Kelas" /></SelectTrigger>
              <SelectContent className="rounded-2xl">{filteredKelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Dari Periode</Label>
            <div className="flex gap-2">
              <Select value={startMonth} onValueChange={setStartMonth}><SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Bulan" /></SelectTrigger><SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
              <Select value={startYear} onValueChange={setStartYear}><SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Tahun" /></SelectTrigger><SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Sampai Periode</Label>
            <div className="flex gap-2">
              <Select value={endMonth} onValueChange={setEndMonth}><SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Bulan" /></SelectTrigger><SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
              <Select value={endYear} onValueChange={setEndYear}><SelectTrigger className="rounded-xl border-border/80 bg-muted/30 text-xs font-medium"><SelectValue placeholder="Tahun" /></SelectTrigger><SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table Card */}
      <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <CardHeader className="border-b border-border/50 px-6 py-4">
          <CardTitle className="text-base font-bold text-foreground">Hasil Rekapitulasi Siswa</CardTitle>
        </CardHeader>
        
        {sortedStudentRecap.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="Belum Ada Data Kehadiran Siswa"
              description="Tidak ditemukan data kehadiran siswa untuk filter kelas dan rentang periode yang Anda pilih."
              actionLabel={selectedKelas || selectedDesa || selectedKelompok ? "Reset Filter" : undefined}
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border/60">
                    <TableHead 
                      className="cursor-pointer hover:bg-muted font-bold text-xs uppercase text-muted-foreground py-3.5 pl-6"
                      onClick={() => requestSort('name')}
                    >
                      Nama Siswa{getSortIndicator('name')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted font-bold text-xs uppercase text-muted-foreground py-3.5"
                      onClick={() => requestSort('className')}
                    >
                      Kelas{getSortIndicator('className')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted font-bold text-xs uppercase text-muted-foreground py-3.5"
                      onClick={() => requestSort('guruName')}
                    >
                      Guru Pengajar{getSortIndicator('guruName')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted text-center font-bold text-xs uppercase text-muted-foreground py-3.5"
                      onClick={() => requestSort('attended')}
                    >
                      Total Hadir / Pertemuan{getSortIndicator('attended')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted text-center font-bold text-xs uppercase text-muted-foreground py-3.5"
                      onClick={() => requestSort('percentage')}
                    >
                      Persentase Kehadiran{getSortIndicator('percentage')}
                    </TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase text-muted-foreground py-3.5 pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudentRecap.map(student => (
                    <TableRow key={student.studentId} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                      <TableCell className="font-semibold text-foreground py-4 pl-6">{student.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-4">{student.className}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-4">{student.guruName}</TableCell>
                      <TableCell className="text-center font-semibold text-xs py-4">{student.attended} / {student.held}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                          <Progress value={student.percentage} className="h-2 flex-1 rounded-full" />
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            student.percentage >= 85
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : student.percentage >= 65
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {student.percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(student)}
                          className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                          title="Detail Kehadiran Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border/50">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedStudentRecap.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="rounded-3xl max-w-lg border border-border/60">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">Detail Kehadiran: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {studentDetailData.map(record => (
              <div key={record.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{record.month} {record.year}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Pertemuan Hadir: {record.meetingsAttended} dari {record.meetingsHeld}</p>
                </div>
                <span className={`font-bold px-2.5 py-1 rounded-full ${
                  record.percentage >= 85 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {record.percentage}%
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}