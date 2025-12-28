import React, { useMemo } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import { GraduationCap, Users2, Users, Contact } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard';
import AnnouncementCard from './AnnouncementCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, School } from 'lucide-react';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface DesaDashboardProps {
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

export default function DesaDashboard({ 
    stats, 
    generusData,
    currentUser,
    attendance,
    kelas,
    materials,
    grades,
    announcements
}: DesaDashboardProps) {
  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements.filter(ann =>
      ann.targetRoles && ann.targetRoles.includes(currentUser.role)
    );
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
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
        <p className="text-indigo-100">
          {currentUser?.role === 'desa' 
            ? `Selamat datang di dasbor Desa ${currentUser?.desa}.` 
            : 'Selamat datang di dashboard.'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
        <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
        <DashboardStatCard title="Total Guru" value={stats.gurus} icon={Contact} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Statistik Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <School className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-foreground">Total Kelas</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.kelas}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium text-foreground">Total Materi</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{materials.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <span className="font-medium text-foreground">Kehadiran Rata-rata</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{overallStats.overallAttendanceRate}%</span>
            </div>
          </CardContent>
        </Card>
        
        <AnnouncementCard announcements={visibleAnnouncements} />
      </div>
    </div>
  );
}