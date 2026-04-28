import React from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import AdminDashboard from './AdminDashboard';
import DesaDashboard from './DesaDashboard';
import KelompokDashboard from './KelompokDashboard';
import GuruDashboard from './GuruDashboard';

interface DashboardSectionProps {
  stats: {
    generus: number;
    desa: number;
    kelompok: number;
    users: number;
    gurus: number;
    kelas: number;
  };
  generusData: Generus[];
  currentUser: User | null;
  attendance: MonthlyAttendance[];
  kelas: Kelas[];
  materials: Material[];
  grades: Grade[];
  announcements: Announcement[];
}

export default function DashboardSection({ 
    stats, 
    generusData, 
    currentUser,
    attendance,
    kelas,
    materials,
    grades,
    announcements
}: DashboardSectionProps) {
  switch (currentUser?.role) {
    case 'guru':
      return (
        <GuruDashboard
          generusData={generusData}
          currentUser={currentUser}
          attendance={attendance}
          kelas={kelas}
          materials={materials}
          grades={grades}
          announcements={announcements}
        />
      );
    case 'kelompok':
      return (
        <KelompokDashboard
          stats={stats}
          generusData={generusData}
          currentUser={currentUser}
          attendance={attendance}
          kelas={kelas}
          materials={materials}
          grades={grades}
          announcements={announcements}
        />
      );
    case 'desa':
      return (
        <DesaDashboard
          stats={stats}
          generusData={generusData}
          currentUser={currentUser}
          attendance={attendance}
          kelas={kelas}
          materials={materials}
          grades={grades}
          announcements={announcements}
        />
      );
    case 'admin':
    case 'adminsuper':
      return (
        <AdminDashboard
          stats={stats}
          generusData={generusData}
          currentUser={currentUser}
          attendance={attendance}
          kelas={kelas}
          materials={materials}
          grades={grades}
          announcements={announcements}
        />
      );
    default:
      return (
        <div className="space-y-6">
          <div className="hero-gradient rounded-xl p-6 shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
            <p className="text-[hsl(var(--hero-muted))]">Selamat datang di dashboard.</p>
          </div>
        </div>
      );
  }
}