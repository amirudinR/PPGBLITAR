import React, { useMemo } from 'react';
import { Kelas, Generus, Material, Grade, getJenjangUsia } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';

interface DetailPencapaianKelasProps {
  kelas: Kelas | undefined;
  generus: Generus[];
  materials: Material[];
  grades: Grade[];
  onBack: () => void;
  startDate: { month: string; year: string };
  endDate: { month: string; year: string };
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function DetailPencapaianKelas({ 
  kelas, 
  generus, 
  materials, 
  grades, 
  onBack,
  startDate,
  endDate
}: DetailPencapaianKelasProps) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const startDateNum = parseInt(startDate.year + (months.indexOf(startDate.month) + 1).toString().padStart(2, '0'), 10);
  const endDateNum = parseInt(endDate.year + (months.indexOf(endDate.month) + 1).toString().padStart(2, '0'), 10);

  // Get students in this class
  const studentsInClass = useMemo(() => {
    if (!kelas) return [];
    return generus.filter(g => kelas.studentIds?.includes(g.id));
  }, [kelas, generus]);

  // Get materials for this class's education level and period
  const relevantMaterials = useMemo(() => {
    if (!kelas) return [];
    
    const jenjangUsia = kelas.jenjangUsia;
    
    return materials.filter(material => {
      const materialJenjangUsia = getJenjangUsia(material.kelas);
      const materialDateNum = parseInt(
        new Date().getFullYear() + 
        (months.indexOf(Array.isArray(material.targetBulan) ? material.targetBulan[0] : material.targetBulan) + 1).toString().padStart(2, '0'),
        10
      );
      
      return (
        materialJenjangUsia === jenjangUsia &&
        materialDateNum >= startDateNum &&
        materialDateNum <= endDateNum
      );
    });
  }, [kelas, materials, startDateNum, endDateNum]);

  // Calculate achievement for each student
  const studentAchievements = useMemo(() => {
    if (!kelas) return [];
    
    return studentsInClass.map(student => {
      const studentGrades = grades.filter(grade => {
        const gradeDateNum = parseInt(grade.year + (months.indexOf(grade.month) + 1).toString().padStart(2, '0'), 10);
        return (
          grade.studentId === student.id &&
          grade.classId === kelas.id &&
          gradeDateNum >= startDateNum &&
          gradeDateNum <= endDateNum
        );
      });

      const achievedCount = studentGrades.filter(grade => grade.grade === 'Tercapai').length;
      const totalCount = relevantMaterials.length;
      const percentage = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

      return {
        student,
        achievedCount,
        totalCount,
        percentage
      };
    });
  }, [studentsInClass, kelas, grades, relevantMaterials, startDateNum, endDateNum]);

  if (!kelas) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detail Pencapaian Kelas</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>Kelas tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detail Pencapaian Kelas</h1>
          <p className="text-muted-foreground">{kelas.namaKelas} - Periode: {startDate.month} {startDate.year} sampai {endDate.month} {endDate.year}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Kelas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama Kelas</p>
            <p className="font-medium">{kelas.namaKelas}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Guru</p>
            <p className="font-medium">{kelas.guruName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jumlah Siswa</p>
            <p className="font-medium">{studentsInClass.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Pencapaian per Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead className="text-center">Target Materi</TableHead>
                <TableHead className="text-center">Tercapai</TableHead>
                <TableHead className="w-48">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentAchievements.map(({ student, achievedCount, totalCount, percentage }) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-center">{totalCount}</TableCell>
                  <TableCell className="text-center">{achievedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-24" />
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}