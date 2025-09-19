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
import PaginationControls from './PaginationControls';

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

  const filteredKelompok = useMemo(() => {
    if (!selectedDesa) return kelompok;
    return kelompok.filter(k => k.desaName === selectedDesa);
  }, [selectedDesa, kelompok]);

  const filteredKelas = useMemo(() => {
    if (isGuruRole) return kelas; // Untuk guru, 'kelas' sudah difilter oleh hook
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
        if (sortConfig.key === 'percentage') {
          if (a.percentage < b.percentage) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a.percentage > b.percentage) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        } else if (sortConfig.key === 'attended') {
          const attendedA = a.attended;
          const attendedB = b.attended;
          if (attendedA < attendedB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (attendedA > attendedB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        } else if (sortConfig.key === 'held') {
          const heldA = a.held;
          const heldB = b.held;
          if (heldA < heldB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (heldA > heldB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        } else {
          if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
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
    setCurrentPage(1); // Reset ke halaman pertama saat sorting berubah
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran Per Siswa</h2>
      <Card className="mb-8">
        <CardHeader><CardTitle>Filter Data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {!isGuruRole && currentUser?.role !== 'desa' && currentUser?.role !== 'kelompok' && (
            <div className="space-y-2">
              <Label>Desa</Label>
              <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                <SelectTrigger><SelectValue placeholder="Semua Desa" /></SelectTrigger>
                <SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {!isGuruRole && currentUser?.role !== 'kelompok' && (
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => requestSort('name')}
                >
                  Nama Siswa{getSortIndicator('name')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => requestSort('className')}
                >
                  Kelas{getSortIndicator('className')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => requestSort('guruName')}
                >
                  Guru{getSortIndicator('guruName')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 text-center whitespace-nowrap"
                  onClick={() => requestSort('attended')}
                >
                  Total Kehadiran{getSortIndicator('attended')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 w-48 whitespace-nowrap"
                  onClick={() => requestSort('percentage')}
                >
                  Persentase{getSortIndicator('percentage')}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudentRecap.map(student => (
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
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedStudentRecap.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
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