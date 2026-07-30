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
    <div className="space-y-8">
      {/* Hero Welcome & Quick Search Banner */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Pusat Kendali PPG BLITAR
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
              Assalamu'alaikum, {currentUser?.name || 'Pengurus'}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ada yang ingin dikelola atau ditinjau hari ini?
            </p>
          </div>
        </div>
      </div>

      {/* Primary & Secondary Stat Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Total Generus"
          value={stats.generus}
          icon={GraduationCap}
          isPrimary={true}
          subtitle="Generasi penerus terdaftar"
        />
        <DashboardStatCard
          title="Total Desa"
          value={stats.desa}
          icon={Home}
          subtitle="Wilayah desa pembinaan"
        />
        <DashboardStatCard
          title="Total Kelompok"
          value={stats.kelompok}
          icon={Users2}
          subtitle="Kelompok binaan aktif"
        />
        <DashboardStatCard
          title="Total Pengguna"
          value={stats.users}
          icon={Users}
          subtitle="Pengurus & guru terdaftar"
        />
      </div>

      {/* Secondary Stats & Announcements Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-bold text-foreground">Ringkasan Pembinaan</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Total Kelas Aktif</p>
                  <p className="text-sm font-bold text-foreground">Tingkat Cabe Rawit - Remaja</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-primary">{stats.kelas}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Total Materi Pembelajaran</p>
                  <p className="text-sm font-bold text-foreground">Kurikulum PPG Blitar</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{materials.length}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/40">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Rata-rata Kehadiran</p>
                  <p className="text-sm font-bold text-foreground">Kehadiran Bulan Ini</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{overallStats.overallAttendanceRate}%</span>
            </div>
          </CardContent>
        </Card>

        <AnnouncementCard announcements={visibleAnnouncements} />
      </div>
    </div>
  );
}