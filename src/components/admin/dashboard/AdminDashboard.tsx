import React, { useMemo } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import { GraduationCap, Home, Users2, Users, Contact, School, BookOpen, Calendar } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard';
import AnnouncementCard from './AnnouncementCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface AdminDashboardProps {
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

export default function AdminDashboard({
  stats,
  generusData,
  currentUser,
  attendance,
  kelas,
  materials,
  grades,
  announcements
}: AdminDashboardProps) {
  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements;
  }, [announcements, currentUser]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonth = months[currentMonthIndex];

    // Overall attendance rate
    const allStudentAttendance = attendance.filter(a =>
      a.year === currentYear &&
      months.indexOf(a.month) === currentMonthIndex
    );

    const totalAttended = allStudentAttendance.reduce((sum, a) => sum + a.meetingsAttended, 0);
    const totalHeld = allStudentAttendance.reduce((sum, a) => sum + a.meetingsHeld, 0);
    const overallAttendanceRate = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

    // Overall material achievement rate
    const allMonthsSoFar = months.slice(0, currentMonthIndex + 1);
    const cumulativeTargetMaterials = materials.filter(m => {
      const targetBulan = Array.isArray(m.targetBulan) ? m.targetBulan :
        typeof m.targetBulan === 'string' ? [m.targetBulan] : [];
      return generusData.some(s => s.pendidikan === m.kelas) &&
        targetBulan.some(b => allMonthsSoFar.includes(b));
    });

    const allAchievedGrades = grades.filter(g =>
      g.year === currentYear &&
      months.indexOf(g.month) <= currentMonthIndex &&
      g.grade === 'Tercapai'
    );

    const totalPossibleCount = generusData.length * cumulativeTargetMaterials.length;
    const overallAchievementRate = totalPossibleCount > 0 ? Math.round((allAchievedGrades.length / totalPossibleCount) * 100) : 0;

    return {
      overallAttendanceRate,
      overallAchievementRate
    };
  }, [attendance, materials, grades, generusData]);

  return (
    <div className="space-y-6">
      <div className="hero-gradient rounded-xl p-6">
        <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
        <p className="text-[hsl(var(--hero-muted))]">
          {currentUser?.role === 'adminsuper' || currentUser?.role === 'admin'
            ? 'Selamat datang di pusat kendali administrasi.'
            : 'Selamat datang di dashboard.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
        <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
        <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Statistik Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="neu-inset flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ background: 'hsl(var(--stat-1) / 0.12)' }}>
                  <School className="h-5 w-5" style={{ color: 'hsl(var(--stat-1))' }} />
                </div>
                <span className="font-medium text-foreground">Total Kelas</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--stat-1))' }}>{stats.kelas}</span>
            </div>

            <div className="neu-inset flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ background: 'hsl(var(--stat-3) / 0.12)' }}>
                  <BookOpen className="h-5 w-5" style={{ color: 'hsl(var(--stat-3))' }} />
                </div>
                <span className="font-medium text-foreground">Total Materi</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--stat-3))' }}>{materials.length}</span>
            </div>

            <div className="neu-inset flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full" style={{ background: 'hsl(var(--stat-4) / 0.12)' }}>
                  <Calendar className="h-5 w-5" style={{ color: 'hsl(var(--stat-4))' }} />
                </div>
                <span className="font-medium text-foreground">Kehadiran Rata-rata</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'hsl(var(--stat-4))' }}>{overallStats.overallAttendanceRate}%</span>
            </div>
          </CardContent>
        </Card>

        <AnnouncementCard announcements={visibleAnnouncements} />
      </div>
    </div>
  );
}