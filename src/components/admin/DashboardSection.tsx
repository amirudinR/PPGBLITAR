import React, { useMemo } from 'react';
import DashboardStatCard from './DashboardStatCard';
import EducationChart from './EducationChart';
import GenderChart from './GenderChart';
import { GraduationCap, Home, Users2, Users } from 'lucide-react';
import { Generus, Pendidikan } from '@/types/admin';

interface DashboardSectionProps {
  stats: {
    generus: number;
    desa: number;
    kelompok: number;
    users: number;
  };
  generusData: Generus[];
}

export default function DashboardSection({ stats, generusData }: DashboardSectionProps) {
  const educationData = useMemo(() => {
    const counts: { [key in Pendidikan]?: number } = {};
    for (const g of generusData) {
      counts[g.pendidikan] = (counts[g.pendidikan] || 0) + 1;
    }
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [generusData]);

  const genderData = useMemo(() => {
    const lakiLaki = generusData.filter(g => g.jenisKelamin === 'Laki-laki').length;
    const perempuan = generusData.filter(g => g.jenisKelamin === 'Perempuan').length;
    return [
      { name: 'Laki-laki', value: lakiLaki },
      { name: 'Perempuan', value: perempuan },
    ];
  }, [generusData]);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
        <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
        <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <EducationChart data={educationData} />
        <GenderChart data={genderData} />
      </div>
    </div>
  );
}