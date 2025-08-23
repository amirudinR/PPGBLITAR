import React, { useState, useEffect, useMemo } from 'react';
import { User, Kelas, Generus, Material, Grade, KELAS_MATERI_LIST } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGrades } from '@/hooks/useGrades';

interface NilaiGenerusSectionProps {
  currentUser: User | null;
  kelas: Kelas[];
  generus: Generus[];
  materials: Material[];
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const gradeOptions = ['Lancar', 'Cukup', 'Kurang', 'Belum'];

export default function NilaiGenerusSection({ currentUser, kelas, generus, materials }: NilaiGenerusSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  
  const { grades, loading, fetchGrades, saveGradesBatch } = useGrades(currentUser);
  
  const [studentGrades, setStudentGrades] = useState<Record<string, string>>({});

  const selectedClass = useMemo(() => kelas.find(k => k.id === selectedClassId), [kelas, selectedClassId]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass || !selectedClass.studentIds) return [];
    return generus.filter(g => selectedClass.studentIds.includes(g.id));
  }, [generus, selectedClass]);

  const availableMaterials = useMemo(() => {
    if (!selectedClass) return [];
    return materials.filter(m => KELAS_MATERI_LIST.includes(m.kelas));
  }, [materials, selectedClass]);

  useEffect(() => {
    if (selectedClassId && selectedMaterialId) {
      fetchGrades(selectedClassId, selectedYear, selectedMonth, selectedMaterialId);
    }
  }, [selectedClassId, selectedYear, selectedMonth, selectedMaterialId, fetchGrades]);

  useEffect(() => {
    const initialGrades = grades.reduce((acc, record) => {
      acc[record.studentId] = record.grade;
      return acc;
    }, {} as Record<string, string>);
    setStudentGrades(initialGrades);
  }, [grades]);

  const handleGradeChange = (studentId: string, value: string) => {
    setStudentGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = () => {
    const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
    if (!selectedClass || !selectedMaterial) return;

    const gradesToSave = studentsInClass.map(student => ({
      studentId: student.id,
      studentName: student.name,
      grade: studentGrades[student.id] || '',
    }));

    saveGradesBatch(gradesToSave, selectedClass, selectedMaterial, selectedYear, selectedMonth);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Input Nilai Generus</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pilih Kelas, Materi, dan Periode</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
            <SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId} disabled={!selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih Materi..." /></SelectTrigger>
            <SelectContent>{availableMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.judulMateri} - {m.rincianMateri.substring(0, 20)}...</SelectItem>)}</SelectContent>
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

      {selectedClassId && selectedMaterialId && (
        <Card>
          <CardHeader>
            <CardTitle>Input Nilai: {materials.find(m => m.id === selectedMaterialId)?.rincianMateri}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="w-48">Nilai</TableHead>
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
                          <Select 
                            value={studentGrades[student.id] || ''}
                            onValueChange={(value) => handleGradeChange(student.id, value)}
                          >
                            <SelectTrigger><SelectValue placeholder="Beri Nilai" /></SelectTrigger>
                            <SelectContent>
                              {gradeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
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