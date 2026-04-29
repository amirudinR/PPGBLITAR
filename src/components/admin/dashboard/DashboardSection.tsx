import React from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import AdminDashboard from './AdminDashboard';
import DesaDashboard from './DesaDashboard';
import KelompokDashboard from './KelompokDashboard';
import GuruDashboard from './GuruDashboard';
import NewFeaturesWidget from './NewFeaturesWidget';

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
  onNavigate?: (section: string) => void;
}

export default function DashboardSection({ 
    stats, 
    generusData, 
    currentUser,
    attendance,
    kelas,
    materials,
    grades,
    announcements,
    onNavigate,
}: DashboardSectionProps) {
  const widget = onNavigate ? (
    <NewFeaturesWidget currentUser={currentUser} onNavigate={onNavigate} />
  ) : null;

  switch (currentUser?.role) {
    case 'guru':
      return (
        <div className="space-y-6">
          {widget}
          <GuruDashboard
            generusData={generusData}
            currentUser={currentUser}
            attendance={attendance}
            kelas={kelas}
            materials={materials}
            grades={grades}
            announcements={announcements}
          />
        </div>
      );
    case 'kelompok':
      return (
        <div className="space-y-6">
          {widget}
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
        </div>
      );
    case 'desa':
      return (
        <div className="space-y-6">
          {widget}
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
        </div>
      );
    case 'admin':
    case 'adminsuper':
      return (
        <div className="space-y-6">
          {widget}
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
        </div>
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