import React, { useState, useMemo } from 'react';
import { User, Kelas, Generus, Material, Grade, KELAS_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RekapNilaiSectionProps {
  currentUser: User | null;
  grades: Grade[];
  kelas: Kelas[];
  generus: Generus[];
  materials: Material[];
  semester: 'Ganjil' | 'Genap';
  setSemester: (semester: 'Ganjil' | 'Genap') => void;
  year: number;
  setYear: (year: number) => void;
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const monthsInOrder = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function RekapNilaiSection({ currentUser, grades, kelas, generus, materials, semester, setSemester, year, setYear }: RekapNilaiSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedPendidikan, setSelectedPendidikan] = useState<string>('');

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

  const semesterMonths = useMemo(() => semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS, [semester]);

  const materialsForRecap = useMemo(() => {
    if (!selectedPendidikan) return [];
    return materials.filter(m => m.kelas === selectedPendidikan && m.semester === semester);
  }, [materials, selectedPendidikan, semester]);

  const recapData = useMemo(() => {
    const studentGrades: Record<string, Record<string, string>> = {};
    
    const semesterGrades = grades.filter(g => 
      g.year === year && 
      (semesterMonths as readonly string[]).includes(g.month) &&
      g.classId === selectedClassId
    );

    const latestGrades = new Map<string, Grade>();
    semesterGrades.forEach(grade => {
      const key = `${grade.studentId}-${grade.materialId}`;
      const existing = latestGrades.get(key);
      if (!existing || monthsInOrder.indexOf(grade.month) > monthsInOrder.indexOf(existing.month)) {
        latestGrades.set(key, grade);
      }
    });

    filteredStudents.forEach(student => {
      studentGrades[student.id] = {};
      materialsForRecap.forEach(material => {
        const grade = latestGrades.get(`${student.id}-${material.id}`);
        studentGrades[student.id][material.id] = grade ? grade.grade : '-';
      });
    });

    return studentGrades;
  }, [grades, filteredStudents, materialsForRecap, year, semesterMonths, selectedClassId]);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Rekap Nilai Generus</h2>
      <Card className="mb-6">
        <CardHeader><CardTitle>Pilih Kelas dan Periode</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedPendidikan} onValueChange={setSelectedPendidikan} disabled={!selectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Pendidikan..." /></SelectTrigger><SelectContent>{availablePendidikan.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          <Select value={semester} onValueChange={(value) => setSemester(value as 'Ganjil' | 'Genap')}><SelectTrigger><SelectValue placeholder="Pilih Semester..." /></SelectTrigger><SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent></Select>
          <Select value={String(year)} onValueChange={(y) => setYear(Number(y))}><SelectTrigger><SelectValue placeholder="Pilih Tahun..." /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
        </CardContent>
      </Card>

      {selectedPendidikan && (
        <Card>
          <CardHeader><CardTitle>Rekap Nilai Semester {semester} {year}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-white z-10">Nama Siswa</TableHead>
                    {materialsForRecap.map(m => <TableHead key={m.id} className="min-w-[200px]">{m.rincianMateri}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-white z-10 font-medium">{student.name}</TableCell>
                      {materialsForRecap.map(material => (
                        <TableCell key={material.id}>
                          {recapData[student.id]?.[material.id] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}