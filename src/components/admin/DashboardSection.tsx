import React, { useMemo, useState } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement, getJenjangUsia, JENJANG_USIA_LIST } from '@/types/admin';
import { GraduationCap, Home, Users2, Users, Contact, School, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard';
import AnnouncementCard from './AnnouncementCard';
import KelasProgressCard from './KelasProgressCard';
import PrioritasGenerusCard from './PrioritasGenerusCard';
import GenderChart from './GenderChart';
import GenerusChart from './GenerusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

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

  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'adminsuper' || currentUser.role === 'admin') {
      return announcements;
    }
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

  // Statistics for kelompok role
  const kelompokStats = useMemo(() => {
    if (currentUser?.role !== 'kelompok') return null;

    // Gender distribution
    const genderData = [
      { name: 'Laki-laki', value: generusData.filter(g => g.jenisKelamin === 'Laki-laki').length },
      { name: 'Perempuan', value: generusData.filter(g => g.jenisKelamin === 'Perempuan').length }
    ];

    // Age group distribution
    const ageGroupSummary: { [key: string]: { name: string; 'Laki-laki': number; 'Perempuan': number } } = {};
    const jenjangOptions = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'];
    
    jenjangOptions.forEach(j => {
      ageGroupSummary[j] = { name: j, 'Laki-laki': 0, 'Perempuan': 0 };
    });

    generusData.forEach(g => {
      const jenjang = getJenjangUsia(g.pendidikan);
      if (ageGroupSummary[jenjang]) {
        ageGroupSummary[jenjang][g.jenisKelamin]++;
      }
    });
    
    const ageGroupData = Object.values(ageGroupSummary);

    return { genderData, ageGroupData };
  }, [currentUser, generusData]);

  // New state for kelompok dashboard filters
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([...JENJANG_USIA_LIST]);
  
  const toggleAgeGroup = (group: string) => {
    setSelectedAgeGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  const filteredGenderData = useMemo(() => {
    if (currentUser?.role !== 'kelompok') return [];
    
    const filteredGenerus = generusData.filter(g => {
      const jenjang = getJenjangUsia(g.pendidikan);
      return selectedAgeGroups.includes(jenjang);
    });

    return [
      { name: 'Laki-laki', value: filteredGenerus.filter(g => g.jenisKelamin === 'Laki-laki').length },
      { name: 'Perempuan', value: filteredGenerus.filter(g => g.jenisKelamin === 'Perempuan').length }
    ];
  }, [currentUser, generusData, selectedAgeGroups]);

  // Calculate overall statistics for all roles
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

  if (currentUser?.role === 'guru' && guruDashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser.name}</h2>
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

  if (currentUser?.role === 'kelompok') {
    // Filter kelas berdasarkan kelompok pengguna
    const userKelas = kelas.filter(k => k.kelompok === currentUser.kelompok);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser.name}</h2>
          <p className="text-teal-100">Selamat datang di dasbor Kelompok {currentUser.kelompok}.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
          <DashboardStatCard title="Total Kelas" value={userKelas.length} icon={School} />
          <DashboardStatCard title="Total Guru" value={stats.gurus} icon={Contact} />
          <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
        </div>
        
        <div className="mb-6">
          <AnnouncementCard announcements={visibleAnnouncements} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Statistik Jumlah Generus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block text-gray-700">Filter Jenjang Usia:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {JENJANG_USIA_LIST.map((group) => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox
                        id={`age-group-${group}`}
                        checked={selectedAgeGroups.includes(group)}
                        onCheckedChange={() => toggleAgeGroup(group)}
                      />
                      <Label htmlFor={`age-group-${group}`} className="text-sm font-normal text-gray-600">
                        {group}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <GenderChart data={filteredGenderData} />
            </CardContent>
          </Card>
          
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Distribusi Generus per Jenjang Usia</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerusChart data={kelompokStats?.ageGroupData || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard for other roles (admin, adminsuper, desa)
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
        <p className="text-indigo-100">
          {currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' 
            ? 'Selamat datang di pusat kendali administrasi.' 
            : currentUser?.role === 'desa' 
            ? `Selamat datang di dasbor Desa ${currentUser?.desa}.` 
            : 'Selamat datang di dashboard.'}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        {currentUser?.role === 'desa' ? (
          <>
            <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
            <DashboardStatCard title="Total Guru" value={stats.gurus} icon={Contact} />
          </>
        ) : (
          <>
            <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
            <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
          </>
        )}
      </div>
      
      {(currentUser?.role === 'desa' || currentUser?.role === 'admin' || currentUser?.role === 'adminsuper') && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Statistik Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <School className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Total Kelas</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.kelas}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Total Materi</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{materials.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-gray-700">Kehadiran Rata-rata</span>
                </div>
                <span className="text-2xl font-bold text-amber-600">{overallStats.overallAttendanceRate}%</span>
              </div>
            </CardContent>
          </Card>
          
          <AnnouncementCard announcements={visibleAnnouncements} />
        </div>
      )}
    </div>
  );
}