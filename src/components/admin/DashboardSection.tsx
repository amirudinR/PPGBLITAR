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
  dashboardFilterCategory: string;
  setDashboardFilterCategory: (value: string) => void;
  dashboardFilterValue: string;
  setDashboardFilterValue: (value: string) => void;
}

const filterCategories = [
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'desa', label: 'Desa' },
    { value: 'kelompok', label: 'Kelompok' },
    { value: 'statusMondok', label: 'Status Mondok' },
];

export default function DashboardSection({ 
    stats, 
    generusData, 
    dashboardFilterCategory, 
    setDashboardFilterCategory, 
    dashboardFilterValue, 
    setDashboardFilterValue 
}: DashboardSectionProps) {

  const valueOptions = useMemo(() => {
    if (!dashboardFilterCategory) return [];
    const uniqueValues = [...new Set(generusData.map(g => g[dashboardFilterCategory as keyof Generus]))];
    return ['Semua', ...uniqueValues.map(String).sort()];
  }, [generusData, dashboardFilterCategory]);

  const filteredGenerus = useMemo(() => {
    if (!dashboardFilterValue || dashboardFilterValue === 'Semua') {
      return generusData;
    }
    return generusData.filter(g => String(g[dashboardFilterCategory as keyof Generus]) === dashboardFilterValue);
  }, [generusData, dashboardFilterCategory, dashboardFilterValue]);

  const genderData = useMemo(() => {
    const dataToUse = filteredGenerus;
    const lakiLaki = dataToUse.filter(g => g.jenisKelamin === 'Laki-laki').length;
    const perempuan = dataToUse.filter(g => g.jenisKelamin === 'Perempuan').length;
    return [
      { name: 'Laki-laki', value: lakiLaki },
      { name: 'Perempuan', value: perempuan },
    ];
  }, [filteredGenerus]);

  const handleCategoryChange = (value: string) => {
    setDashboardFilterCategory(value);
    setDashboardFilterValue('Semua');
  };

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
            <CardTitle>Filter Generus</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Select value={dashboardFilterCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori..." />
              </SelectTrigger>
              <SelectContent>
                {filterCategories.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dashboardFilterValue} onValueChange={setDashboardFilterValue}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Nilai..." />
              </SelectTrigger>
              <SelectContent>
                {valueOptions.map(option => (
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