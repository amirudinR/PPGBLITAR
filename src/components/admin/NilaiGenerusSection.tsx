import React, { useState, useEffect, useMemo } from 'react';
import { User, Kelas, Generus, Material, Grade, KELAS_MATERI_LIST } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGrades } from '@/hooks/useGrades';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const [selectedPendidikan, setSelectedPendidikan] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedJudulMateri, setSelectedJudulMateri] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  
  const { grades, loading, fetchGrades, saveGradesBatch } = useGrades(currentUser);
  
  const [studentGrades, setStudentGrades] = useState<Record<string, string>>({});

  const selectedClass = useMemo(() => kelas.find(k => k.id === selectedClassId), [kelas, selectedClassId]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass || !selectedClass.studentIds) return [];
    return generus.filter(g => selectedClass.studentIds.includes(g.id));
  }, [generus, selectedClass]);

  const availablePendidikan = useMemo(() => {
    if (!studentsInClass.length) return [];
    const pendidikanSet = new Set(studentsInClass.map(s => s.pendidikan));
    return Array.from(pendidikanSet);
  }, [studentsInClass]);

  const filteredStudents = useMemo(() => {
    if (!selectedPendidikan) return studentsInClass;
    return studentsInClass.filter(s => s.pendidikan === selectedPendidikan);
  }, [studentsInClass, selectedPendidikan]);

  const availableMaterialsForPendidikan = useMemo(() => {
    if (!selectedClass || !selectedPendidikan) return [];
    const isValidKelasMateri = (KELAS_MATERI_LIST as readonly string[]).includes(selectedPendidikan);
    if (!isValidKelasMateri) return [];
    return materials.filter(m => m.kelas === selectedPendidikan);
  }, [materials, selectedClass, selectedPendidikan]);

  const availableJudulMateri = useMemo(() => {
    if (!availableMaterialsForPendidikan.length) return [];
    const judulSet = new Set(availableMaterialsForPendidikan.map(m => m.judulMateri));
    return Array.from(judulSet);
  }, [availableMaterialsForPendidikan]);

  const availableRincianMateri = useMemo(() => {
    if (!selectedJudulMateri) return [];
    return availableMaterialsForPendidikan.filter(m => m.judulMateri === selectedJudulMateri);
  }, [availableMaterialsForPendidikan, selectedJudulMateri]);

  useEffect(() => {
    setSelectedPendidikan('');
    setSelectedJudulMateri('');
    setSelectedMaterialId('');
  }, [selectedClassId]);

  useEffect(() => {
    setSelectedJudulMateri('');
    setSelectedMaterialId('');
  }, [selectedPendidikan]);

  useEffect(() => {
    setSelectedMaterialId('');
  }, [selectedJudulMateri]);

  useEffect(() => {
    if (selectedClassId && selectedMaterialId) {
      fetchGrades(selectedClassId, selectedYear, selectedMonth, selectedMaterialId);
    } else {
      setStudentGrades({});
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

    const gradesToSave = filteredStudents.map(student => ({
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
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger>
            <SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedPendidikan} onValueChange={setSelectedPendidikan} disabled={!selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Pilih Pendidikan..." /></SelectTrigger>
            <SelectContent>{availablePendidikan.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedJudulMateri} onValueChange={setSelectedJudulMateri} disabled={!selectedPendidikan}>
            <SelectTrigger><SelectValue placeholder="Pilih Judul Materi..." /></SelectTrigger>
            <SelectContent>{availableJudulMateri.map(judul => <SelectItem key={judul} value={judul}>{judul}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId} disabled={!selectedJudulMateri}>
            <SelectTrigger><SelectValue placeholder="Pilih Rincian..." /></SelectTrigger>
            <SelectContent>{availableRincianMateri.map(m => <SelectItem key={m.id} value={m.id}>{m.rincianMateri}</SelectItem>)}</SelectContent>
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
                    <TableHead className="w-[400px]">Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Memuat...</TableCell></TableRow>
                  ) : (
                    filteredStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <RadioGroup
                            value={studentGrades[student.id] || ''}
                            onValueChange={(value) => handleGradeChange(student.id, value)}
                            className="flex items-center space-x-4"
                          >
                            {gradeOptions.map(opt => (
                              <div key={opt} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt} id={`${student.id}-${opt}`} />
                                <Label htmlFor={`${student.id}-${opt}`} className="font-normal">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
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