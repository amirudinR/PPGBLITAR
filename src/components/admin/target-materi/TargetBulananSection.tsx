import React, { useState, useMemo } from 'react';
import { Kelas, Material, getJenjangUsia } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TargetBulananSectionProps {
  kelas: Kelas[];
  materials: Material[];
  currentUser: any;
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export default function TargetBulananSection({ kelas, materials, currentUser }: TargetBulananSectionProps) {
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

  // Get materials for the selected period and class education level
  const getTargetMaterials = (kelasItem: Kelas) => {
    const jenjangUsia = kelasItem.jenjangUsia;
    const startDateNum = parseInt(startYear + (months.indexOf(startMonth) + 1).toString().padStart(2, '0'), 10);
    const endDateNum = parseInt(endYear + (months.indexOf(endMonth) + 1).toString().padStart(2, '0'), 10);

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
  };

  // Group materials by subject
  const groupMaterialsBySubject = (materialsList: Material[]) => {
    const grouped: Record<string, Material[]> = {};
    materialsList.forEach(material => {
      if (!grouped[material.judulMateri]) {
        grouped[material.judulMateri] = [];
      }
      grouped[material.judulMateri].push(material);
    });
    return grouped;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Target Bulanan</h2>
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredKelas.map(kelasItem => {
          const targetMaterials = getTargetMaterials(kelasItem);
          const groupedMaterials = groupMaterialsBySubject(targetMaterials);
          
          return (
            <Card key={kelasItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{kelasItem.namaKelas}</span>
                  <Badge variant="secondary">{kelasItem.jenjangUsia}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Guru: {kelasItem.guruName}</p>
              </CardHeader>
              <CardContent>
                {targetMaterials.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedMaterials).map(([subject, materialsList]) => (
                      <div key={subject} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2">{subject}</h3>
                        <div className="space-y-3">
                          {materialsList.map((material, index) => (
                            <div key={index} className="border-b pb-3 last:border-b-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-medium">{material.rincianMateri}</p>
                                <Badge variant="outline" className="text-xs">
                                  {Array.isArray(material.targetBulan) 
                                    ? material.targetBulan.join(', ') 
                                    : material.targetBulan}
                                </Badge>
                              </div>
                              <Progress value={0} className="mt-2" />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>0%</span>
                                <span>Target: 100%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tidak ada target materi untuk periode ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}