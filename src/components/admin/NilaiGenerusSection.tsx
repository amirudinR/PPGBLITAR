import React, { useState, useEffect, useMemo } from 'react';
import { User, Kelas, Generus, Material, Grade, KELAS_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';
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

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const gradeOptions = ['Lancar', 'Cukup', 'Kurang', 'Belum'];

export default function NilaiGenerusSection({ currentUser, kelas, generus, materials }: NilaiGenerusSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedPendidikan, setSelectedPendidikan] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [selectedMonth, setSelectedMonth] = useState<string>('Juli');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedJudulMateri, setSelectedJudulMateri] = useState<string>('');
  
  const { grades, loading, fetchGrades, saveGradesBatch } = useGrades(currentUser);
  const [gradesMatrix, setGradesMatrix] = useState<Record<string, Record<string, string>>>({});

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
    if (!selectedPendidikan) return [];
    return studentsInClass.filter(s => s.pendidikan === selectedPendidikan);
  }, [studentsInClass, selectedPendidikan]);

  const availableMonths = useMemo(() => selectedSemester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS, [selectedSemester]);

  const availableJudulMateri = useMemo(() => {
    if (!selectedPendidikan) return [];
    const isValidKelasMateri = (KELAS_MATERI_LIST as readonly string[]).includes(selectedPendidikan);
    if (!isValidKelasMateri) return [];
    const judulSet = new Set(materials
      .filter(m => m.kelas === selectedPendidikan && m.semester === selectedSemester)
      .map(m => m.judulMateri));
    return Array.from(judulSet);
  }, [materials, selectedPendidikan, selectedSemester]);

  const materialsForTable = useMemo(() => {
    if (!selectedJudulMateri || !selectedPendidikan) return [];
    return materials.filter(m => 
      m.kelas === selectedPendidikan && 
      m.semester === selectedSemester && 
      m.judulMateri === selectedJudulMateri &&
      m.targetBulan.includes(selectedMonth)
    );
  }, [materials, selectedPendidikan, selectedSemester, selectedJudulMateri, selectedMonth]);

  useEffect(() => {
    setSelectedPendidikan('');
    setSelectedJudulMateri('');
  }, [selectedClassId]);

  useEffect(() => {
    setSelectedJudulMateri('');
    if (!(availableMonths as readonly string[]).includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [selectedPendidikan, selectedSemester, availableMonths, selectedMonth]);

  useEffect(() => {
    if (selectedClassId && selectedPendidikan) {
      fetchGrades(selectedClassId, selectedYear, selectedMonth);
    }
  }, [selectedClassId, selectedPendidikan, selectedYear, selectedMonth, fetchGrades]);

  useEffect(() => {
    const newMatrix: Record<string, Record<string, string>> = {};
    grades.forEach(grade => {
      if (!newMatrix[grade.studentId]) {
        newMatrix[grade.studentId] = {};
      }
      newMatrix[grade.studentId][grade.materialId] = grade.grade;
    });
    setGradesMatrix(newMatrix);
  }, [grades]);

  const handleGradeChange = (studentId: string, materialId: string, value: string) => {
    setGradesMatrix(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [materialId]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!currentUser || !selectedClass) return;
    const gradesToSave: Omit<Grade, 'id'>[] = [];
    filteredStudents.forEach(student => {
      materialsForTable.forEach(material => {
        const gradeValue = gradesMatrix[student.id]?.[material.id];
        if (gradeValue) {
          gradesToSave.push({
            studentId: student.id, studentName: student.name, classId: selectedClass.id,
            materialId: material.id, judulMateri: material.judulMateri, rincianMateri: material.rincianMateri,
            year: selectedYear, month: selectedMonth, grade: gradeValue, guruId: currentUser.id,
            desa: selectedClass.desa, kelompok: selectedClass.kelompok,
          });
        }
      });
    });
    const success = await saveGradesBatch(gradesToSave);
    if (success) {
      fetchGrades(selectedClassId, selectedYear, selectedMonth);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Input Nilai Generus</h2>
      <Card className="mb-6">
        <CardHeader><CardTitle>Pilih Kelas, Materi, dan Periode</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedPendidikan} onValueChange={setSelectedPendidikan} disabled={!selectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Pendidikan..." /></SelectTrigger><SelectContent>{availablePendidikan.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value as 'Ganjil' | 'Genap')}><SelectTrigger><SelectValue placeholder="Pilih Semester..." /></SelectTrigger><SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent></Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger><SelectValue placeholder="Pilih Bulan..." /></SelectTrigger><SelectContent>{availableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
          <Select value={String(selectedYear)} onValueChange={(y) => setSelectedYear(Number(y))}><SelectTrigger><SelectValue placeholder="Pilih Tahun..." /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedJudulMateri} onValueChange={setSelectedJudulMateri} disabled={!selectedPendidikan}><SelectTrigger><SelectValue placeholder="Pilih Judul Materi..." /></SelectTrigger><SelectContent>{availableJudulMateri.map(judul => <SelectItem key={judul} value={judul}>{judul}</SelectItem>)}</SelectContent></Select>
        </CardContent>
      </Card>

      {selectedJudulMateri && (
        <Card>
          <CardHeader><CardTitle>Input Nilai: {selectedJudulMateri} - {selectedMonth} {selectedYear}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10">Nama Siswa</TableHead>
                    {materialsForTable.map(m => <TableHead key={m.id} className="min-w-[200px]">{m.rincianMateri}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={materialsForTable.length + 1} className="text-center">Memuat...</TableCell></TableRow>
                  ) : (
                    filteredStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-white z-10 font-medium">{student.name}</TableCell>
                        {materialsForTable.map(material => (
                          <TableCell key={material.id}>
                            <Select value={gradesMatrix[student.id]?.[material.id] || ''} onValueChange={(value) => handleGradeChange(student.id, material.id, value)}>
                              <SelectTrigger><SelectValue placeholder="Beri Nilai" /></SelectTrigger>
                              <SelectContent>{gradeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                        ))}
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