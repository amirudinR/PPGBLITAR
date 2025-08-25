import React, { useState, useMemo, useEffect } from 'react';
import { User, Kelas, Generus, Material } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGrades } from '@/hooks/useGrades';
import { Check, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RekapNilaiSectionProps {
  currentUser: User | null;
  kelas: Kelas[];
  generus: Generus[];
  materials: Material[];
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

export default function RekapNilaiSection({
  currentUser, kelas, generus, materials,
  startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear
}: RekapNilaiSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Generus | null>(null);

  const { grades, loading, fetchGrades } = useGrades(currentUser);

  const selectedClass = useMemo(() => kelas.find(k => k.id === selectedClassId), [kelas, selectedClassId]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass || !selectedClass.studentIds) return [];
    return generus.filter(g => selectedClass.studentIds.includes(g.id));
  }, [generus, selectedClass]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGrades(selectedClassId);
    }
  }, [selectedClassId, fetchGrades]);

  const studentRecap = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);

    return studentsInClass.map(student => {
      const possibleMaterialsForStudent = materials.filter(m => m.kelas === student.pendidikan);
      
      const studentGrades = grades.filter(g => {
        const recordMonthNum = parseInt(g.year + (monthMap[g.month] || '00'), 10);
        return g.studentId === student.id && recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
      });

      const achievedMaterialIds = new Set(studentGrades.filter(g => g.grade === 'Tercapai').map(g => g.materialId));
      const achievedCount = achievedMaterialIds.size;
      
      const totalPossibleCount = possibleMaterialsForStudent.length;
      const percentage = totalPossibleCount > 0 ? Math.round((achievedCount / totalPossibleCount) * 100) : 0;

      return {
        student,
        percentage,
        achievedCount,
        totalPossibleCount
      };
    });
  }, [grades, studentsInClass, materials, startMonth, startYear, endMonth, endYear]);

  const studentDetailData = useMemo(() => {
    if (!selectedStudent) return [];
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);

    const possibleMaterials = materials.filter(m => m.kelas === selectedStudent.pendidikan);
    const studentGrades = grades.filter(g => {
      const recordMonthNum = parseInt(g.year + (monthMap[g.month] || '00'), 10);
      return g.studentId === selectedStudent.id && recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
    });

    const achievedMaterialIds = new Set(studentGrades.filter(g => g.grade === 'Tercapai').map(g => g.materialId));

    return possibleMaterials.map(material => ({
      ...material,
      status: achievedMaterialIds.has(material.id) ? 'Tercapai' : 'Belum'
    }));
  }, [selectedStudent, grades, materials, startMonth, startYear, endMonth, endYear]);

  const handleViewDetails = (student: Generus) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleExportPDF = () => {
    if (!selectedClass || studentRecap.length === 0) return;

    const doc = new jsPDF();
    const startMonthLabel = months.find(m => m.value === startMonth)?.label;
    const endMonthLabel = months.find(m => m.value === endMonth)?.label;

    doc.setFontSize(18);
    doc.text("Laporan Nilai Generus", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Kelas: ${selectedClass.namaKelas}`, 14, 32);
    doc.text(`Guru: ${currentUser?.name || 'N/A'}`, 14, 38);
    doc.text(`Periode: ${startMonthLabel} ${startYear} - ${endMonthLabel} ${endYear}`, 14, 44);

    autoTable(doc, {
      startY: 50,
      head: [['No', 'Nama Siswa', 'Pendidikan', 'Persentase Tercapai']],
      body: studentRecap.map((recap, index) => [
        index + 1,
        recap.student.name,
        recap.student.pendidikan,
        `${recap.percentage}%`
      ]),
      headStyles: { fillColor: [79, 70, 229] }, // Indigo color
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`laporan_nilai_${selectedClass.namaKelas}.pdf`);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Rekap Nilai Generus</h2>
      <Card className="mb-6">
        <CardHeader><CardTitle>Filter Data Rekap</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Kelas</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent></Select>
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

      {selectedClassId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rekapitulasi Nilai Kelas: {selectedClass?.namaKelas}</CardTitle>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Pendidikan</TableHead>
                  <TableHead className="w-48">Persentase Tercapai</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Memuat...</TableCell></TableRow>
                ) : (
                  studentRecap.map(recap => (
                    <TableRow key={recap.student.id}>
                      <TableCell>{recap.student.name}</TableCell>
                      <TableCell>{recap.student.pendidikan}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Progress value={recap.percentage} className="w-24" /><span>{recap.percentage}%</span></div></TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(recap.student)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Nilai: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rincian Materi</TableHead>
                  <TableHead>Target Bulan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentDetailData.map(material => (
                  <TableRow key={material.id}>
                    <TableCell>{material.rincianMateri}</TableCell>
                    <TableCell>{Array.isArray(material.targetBulan) ? material.targetBulan.join(', ') : ''}</TableCell>
                    <TableCell className="text-center">
                      {material.status === 'Tercapai' ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        '-'
                      )}
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