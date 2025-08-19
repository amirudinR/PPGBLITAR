import React, { useMemo } from 'react';
import DashboardStatCard from './DashboardStatCard';
import GenderChart from './GenderChart';
import FilteredGenerusTable from './FilteredGenerusTable';
import { GraduationCap, Home, Users2, Users } from 'lucide-react';
import { Generus } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardSectionProps {
  stats: {
    generus: number;
    desa: number;
    kelompok: number;
    users: number;
  };
  generusData: Generus[];
  selectedEducation: string;
  setSelectedEducation: (value: string) => void;
}

export default function DashboardSection({ stats, generusData, selectedEducation, setSelectedEducation }: DashboardSectionProps) {
  const educationOptions = useMemo(() => {
    const uniqueEducation = [...new Set(generusData.map(g => g.pendidikan))];
    return ['Semua', ...uniqueEducation.sort()];
  }, [generusData]);

  const filteredGenerus = useMemo(() => {
    if (!selectedEducation || selectedEducation === 'Semua') {
      return generusData;
    }
    return generusData.filter(g => g.pendidikan === selectedEducation);
  }, [generusData, selectedEducation]);

  const genderData = useMemo(() => {
    const dataToUse = filteredGenerus;
    const lakiLaki = dataToUse.filter(g => g.jenisKelamin === 'Laki-laki').length;
    const perempuan = dataToUse.filter(g => g.jenisKelamin === 'Perempuan').length;
    return [
      { name: 'Laki-laki', value: lakiLaki },
      { name: 'Perempuan', value: perempuan },
    ];
  }, [filteredGenerus]);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
        <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
        <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Filter Generus Berdasarkan Pendidikan</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEducation} onValueChange={setSelectedEducation}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tingkat pendidikan..." />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <GenderChart data={genderData} />
      </div>
      <FilteredGenerusTable generus={filteredGenerus} />
    </div>
  );
}