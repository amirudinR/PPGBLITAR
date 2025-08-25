import React, { useMemo } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement } from '@/types/admin';
import { GraduationCap, Home, Users2, Users, Contact, School } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard';
import AnnouncementCard from './AnnouncementCard';
import KelasProgressCard from './KelasProgressCard';
import PrioritasGenerusCard from './PrioritasGenerusCard';

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

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
        studentsInClass.some(s => s.pendidikan === m.kelas) && m.targetBulan.includes(currentMonth)
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
      const cumulativeTargetMaterials = materials.filter(m => m.kelas === student.pendidikan && m.targetBulan.some(b => allMonthsSoFar.includes(b)));
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

  if (currentUser?.role === 'guru' && guruDashboardData) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser.name}</h2>
          <p className="text-muted-foreground">Selamat datang di dasbor Kelompok {currentUser.kelompok}.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <AnnouncementCard announcements={announcements} />
          <PrioritasGenerusCard 
            lowAttendanceStudents={guruDashboardData.lowAttendanceStudents}
            behindTargetStudents={guruDashboardData.behindTargetStudents}
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight mb-4">Kelas yang Diajar</h3>
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

  // Fallback for other roles
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        {currentUser?.role === 'kelompok' ? (
          <>
            <DashboardStatCard title="Total Guru" value={stats.gurus} icon={Contact} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
          </>
        ) : currentUser?.role === 'desa' ? (
          <>
            <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
          </>
        ) : (
          <>
            <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
            <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
          </>
        )}
      </div>
    </div>
  );
}