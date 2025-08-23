import React, { useState, useMemo, useEffect } from 'react';
import { User, Kelas, Generus, Material, KELAS_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGrades } from '@/hooks/useGrades';
import { Check } from 'lucide-react';

interface RekapNilaiSectionProps {
  currentUser: User | null;
  kelas: Kelas[];
  generus: Generus[];
  materials: Material[];
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function RekapNilaiSection({ currentUser, kelas, generus, materials }: RekapNilaiSectionProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedPendidikan, setSelectedPendidikan] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [selectedMonth, setSelectedMonth] = useState<string>('Juli');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { grades, loading, fetchGrades } = useGrades(currentUser);

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

  const materialsForRecap = useMemo(() => {
    if (!selectedPendidikan) return [];
    return materials.filter(m => 
      m.kelas === selectedPendidikan && 
      m.semester === selectedSemester &&
      m.targetBulan.includes(selectedMonth)
    );
  }, [materials, selectedPendidikan, selectedSemester, selectedMonth]);

  useEffect(() => {
    setSelectedPendidikan('');
  }, [selectedClassId]);

  useEffect(() => {
    if (!(availableMonths as readonly string[]).includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [selectedSemester, availableMonths, selectedMonth]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGrades(selectedClassId);
    }
  }, [selectedClassId, fetchGrades]);

  const gradesMap = useMemo(() => {
    const map = new Map<string, string>();
    grades
      .filter(g => g.year === selectedYear && g.month === selectedMonth)
      .forEach(grade => {
        map.set(`${grade.studentId}-${grade.materialId}`, grade.grade);
      });
    return map;
  }, [grades, selectedYear, selectedMonth]);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Rekap Nilai Generus</h2>
      <Card className="mb-6">
        <CardHeader><CardTitle>Filter Data Rekap</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Kelas..." /></SelectTrigger><SelectContent>{kelas.map(k => <SelectItem key={k.id} value={k.id}>{k.namaKelas}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedPendidikan} onValueChange={setSelectedPendidikan} disabled={!selectedClassId}><SelectTrigger><SelectValue placeholder="Pilih Pendidikan..." /></SelectTrigger><SelectContent>{availablePendidikan.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedSemester} onValueChange={(value) => setSelectedSemester(value as 'Ganjil' | 'Genap')}><SelectTrigger><SelectValue placeholder="Pilih Semester..." /></SelectTrigger><SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent></Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger><SelectValue placeholder="Pilih Bulan..." /></SelectTrigger><SelectContent>{availableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
          <Select value={String(selectedYear)} onValueChange={(y) => setSelectedYear(Number(y))}><SelectTrigger><SelectValue placeholder="Pilih Tahun..." /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
        </CardContent>
      </Card>

      {selectedPendidikan && (
        <Card>
          <CardHeader><CardTitle>Rekap Nilai - {selectedPendidikan} - {selectedMonth} {selectedYear}</CardTitle></CardHeader>
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
                  {loading ? (
                    <TableRow><TableCell colSpan={materialsForRecap.length + 1} className="text-center">Memuat...</TableCell></TableRow>
                  ) : (
                    filteredStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="sticky left-0 bg-white z-10 font-medium">{student.name}</TableCell>
                        {materialsForRecap.map(material => (
                          <TableCell key={material.id} className="text-center">
                            {gradesMap.get(`${student.id}-${material.id}`) === 'Tercapai' ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}