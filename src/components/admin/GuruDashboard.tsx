import React, { useMemo } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import { GraduationCap, School, Calendar, TrendingUp, Contact } from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';
import PrioritasGenerusCard from './PrioritasGenerusCard';
import KelasProgressCard from './KelasProgressCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface GuruDashboardProps {
  generusData: Generus[];
  currentUser: User | null;
  attendance: MonthlyAttendance[];
  kelas: Kelas[];
  materials: Material[];
  grades: Grade[];
  announcements: Announcement[];
}

export default function GuruDashboard({ 
    generusData,
    currentUser,
    attendance,
    kelas,
    materials,
    grades,
    announcements
}: GuruDashboardProps) {
  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements.filter(ann =>
      ann.targetRoles && ann.targetRoles.includes(currentUser.role)
    );
  }, [announcements, currentUser]);

  const guruDashboardData = useMemo(() => {
    if (currentUser?.role !== 'guru') return null;

    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonth = months[currentMonthIndex];

    // Kelas Progress (hanya untuk bulan ini)
    const kelasProgress = kelas.map(k => {
      const studentsInClass = generusData.filter(g => k.studentIds.includes(g.id));
      const studentIds = studentsInClass.map(s => s.id);
      
      const possibleMaterials = materials.filter(m => 
        studentsInClass.some(s => s.pendidikan === m.kelas) && 
        (Array.isArray(m.targetBulan) ? m.targetBulan.includes(currentMonth) : 
         typeof m.targetBulan === 'string' && m.targetBulan === currentMonth)
      );
      
      const achievedGrades = grades.filter(g => 
        studentIds.includes(g.studentId) &&
        g.month === currentMonth &&
        g.year === currentYear &&
        g.grade === 'Tercapai'
      );

      const totalTargets = studentsInClass.length * possibleMaterials.length;
      const progress = totalTargets > 0 ? Math.round((achievedGrades.length / totalTargets) * 100) : 0;

      return {
        namaKelas: k.namaKelas,
        jumlahGenerus: studentsInClass.length,
        progress: progress,
      };
    });

    // Generus Prioritas (kumulatif sampai bulan ini)
    const studentStats = generusData.map(student => {
      // Kehadiran Kumulatif
      const studentAttendance = attendance.filter(a => a.studentId === student.id && a.year === currentYear && months.indexOf(a.month) <= currentMonthIndex);
      const totalAttended = studentAttendance.reduce((sum, a) => sum + a.meetingsAttended, 0);
      const totalHeld = studentAttendance.reduce((sum, a) => sum + a.meetingsHeld, 0);
      const attendancePercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 100;

      // Target Materi Kumulatif
      const allMonthsSoFar = months.slice(0, currentMonthIndex + 1);
      const cumulativeTargetMaterials = materials.filter(m => {
        // Pastikan targetBulan adalah array sebelum menggunakan some()
        const targetBulan = Array.isArray(m.targetBulan) ? m.targetBulan : 
                           typeof m.targetBulan === 'string' ? [m.targetBulan] : [];
        return m.kelas === student.pendidikan && targetBulan.some(b => allMonthsSoFar.includes(b));
      });
      
      const studentGrades = grades.filter(g => g.studentId === student.id && g.year === currentYear && months.indexOf(g.month) <= currentMonthIndex && g.grade === 'Tercapai');
      const achievedMaterialIds = new Set(studentGrades.map(g => g.materialId));
      
      const totalPossibleCount = cumulativeTargetMaterials.length;
      const achievedCount = achievedMaterialIds.size;
      const targetPercentage = totalPossibleCount > 0 ? Math.round((achievedCount / totalPossibleCount) * 100) : 100;

      return { name: student.name, attendancePercentage, targetPercentage };
    });

    const lowAttendanceStudents = studentStats
      .filter(s => s.attendancePercentage < 80)
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
      .slice(0, 5)
      .map(s => ({ name: s.name, stat: s.attendancePercentage }));

    const behindTargetStudents = studentStats
      .filter(s => s.targetPercentage < 70)
      .sort((a, b) => a.targetPercentage - b.targetPercentage)
      .slice(0, 5)
      .map(s => ({ name: s.name, stat: s.targetPercentage }));

    return { kelasProgress, lowAttendanceStudents, behindTargetStudents };
  }, [currentUser, kelas, generusData, materials, grades, attendance]);

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
      // Pastikan targetBulan adalah array sebelum menggunakan some()
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

  if (!guruDashboardData) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
        <p className="text-indigo-100">Selamat datang di dasbor Anda sebagai Guru.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Kehadiran Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{overallStats.overallAttendanceRate}%</div>
            <Progress value={overallStats.overallAttendanceRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Pencapaian Materi</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{overallStats.overallAchievementRate}%</div>
            <Progress value={overallStats.overallAchievementRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Total Kelas</CardTitle>
            <School className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{kelas.length}</div>
            <p className="text-xs text-amber-700 mt-1">kelas yang diajar</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800">Total Generus</CardTitle>
            <GraduationCap className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{generusData.length}</div>
            <p className="text-xs text-rose-700 mt-1">siswa binaan</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <AnnouncementCard announcements={visibleAnnouncements} />
        <PrioritasGenerusCard 
          lowAttendanceStudents={guruDashboardData.lowAttendanceStudents}
          behindTargetStudents={guruDashboardData.behindTargetStudents}
        />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-4 text-gray-800">Progress Kelas Bulan {months[new Date().getMonth()]}</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guruDashboardData.kelasProgress.map(k => (
            <KelasProgressCard 
              key={k.namaKelas}
              namaKelas={k.namaKelas}
              jumlahGenerus={k.jumlahGenerus}
              progress={k.progress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}