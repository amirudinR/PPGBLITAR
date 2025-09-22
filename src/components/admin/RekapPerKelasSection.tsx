import React, { useState, useMemo } from 'react';
import { Kelas, Material, Grade, getJenjangUsia } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Eye } from 'lucide-react';

interface RekapPerKelasSectionProps {
  kelas: Kelas[];
  materials: Material[];
  grades: Grade[];
  currentUser: any;
  onViewDetail: (kelasId: string) => void;
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function RekapPerKelasSection({ kelas, materials, grades, currentUser, onViewDetail }: RekapPerKelasSectionProps) {
  const [startMonth, setStartMonth] = useState(months[new Date().getMonth()]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState(months[new Date().getMonth()]);
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  // Filter kelas berdasarkan kelompok pengguna
  const filteredKelas = useMemo(() => {
    if (currentUser?.role === 'kelompok') {
      return kelas.filter(k => k.kelompok === currentUser.kelompok);
    }
    return kelas;
  }, [kelas, currentUser]);

  // Calculate achievement percentage for each class
  const calculateClassAchievement = (kelasItem: Kelas) => {
    const jenjangUsia = kelasItem.jenjangUsia;
    const startDateNum = parseInt(startYear + (months.indexOf(startMonth) + 1).toString().padStart(2, '0'), 10);
    const endDateNum = parseInt(endYear + (months.indexOf(endMonth) + 1).toString().padStart(2, '0'), 10);

    // Get relevant materials for this class's education level and period
    const relevantMaterials = materials.filter(material => {
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

    if (relevantMaterials.length === 0) {
      return { percentage: 0, achieved: 0, total: 0 };
    }

    // Get grades for this class and period
    const classGrades = grades.filter(grade => {
      const gradeDateNum = parseInt(grade.year + (months.indexOf(grade.month) + 1).toString().padStart(2, '0'), 10);
      return (
        grade.classId === kelasItem.id &&
        gradeDateNum >= startDateNum &&
        gradeDateNum <= endDateNum
      );
    });

    // Count achieved targets
    const achievedCount = classGrades.filter(grade => grade.grade === 'Tercapai').length;
    const totalCount = relevantMaterials.length * (kelasItem.studentIds?.length || 0);
    
    const percentage = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

    return { percentage, achieved: achievedCount, total: totalCount };
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Per Kelas</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Periode Awal</Label>
            <div className="flex gap-2">
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={startYear} onValueChange={setStartYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Periode Akhir</Label>
            <div className="flex gap-2">
              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={endYear} onValueChange={setEndYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Pencapaian Target Materi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Jenjang Usia</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-center">Jumlah Siswa</TableHead>
                <TableHead className="w-48">Persentase Pencapaian</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKelas.map(kelasItem => {
                const achievement = calculateClassAchievement(kelasItem);
                
                return (
                  <TableRow key={kelasItem.id}>
                    <TableCell className="font-medium">{kelasItem.namaKelas}</TableCell>
                    <TableCell>{kelasItem.jenjangUsia}</TableCell>
                    <TableCell>{kelasItem.guruName}</TableCell>
                    <TableCell className="text-center">{kelasItem.studentIds?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={achievement.percentage} className="w-24" />
                        <span className="text-sm font-medium">{achievement.percentage}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {achievement.achieved} dari {achievement.total} target
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewDetail(kelasItem.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}