import React, { useMemo, useState } from 'react';
import { User, Generus, MonthlyAttendance, Kelas, Material, Grade, Announcement, getJenjangUsia, JENJANG_USIA_LIST } from '@/types/admin';
import { GraduationCap, Users, Contact, School, AlertTriangle } from 'lucide-react';
import DashboardStatCard from './DashboardStatCard';
import AnnouncementCard from './AnnouncementCard';
import PrioritasGenerusCard from './PrioritasGenerusCard';
import GenderChart from './GenderChart';
import GenerusChart from './GenerusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useM5U } from '@/hooks/useM5U';

interface KelompokDashboardProps {
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

export default function KelompokDashboard({ 
    stats, 
    generusData,
    currentUser,
    attendance,
    kelas,
    materials,
    grades,
    announcements
}: KelompokDashboardProps) {
  // Use M5U hook
  const { isM5UNotImplemented } = useM5U(currentUser);
  
  // New state for kelompok dashboard filters
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([...JENJANG_USIA_LIST]);
  
  const toggleAgeGroup = (group: string) => {
    setSelectedAgeGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  const visibleAnnouncements = useMemo(() => {
    if (!currentUser) return [];
    return announcements.filter(ann =>
      ann.targetRoles && ann.targetRoles.includes(currentUser.role)
    );
  }, [announcements, currentUser]);

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

  // Data untuk Prioritas Generus Card (untuk kelompok)
  const priorityStudents = useMemo(() => {
    if (currentUser?.role !== 'kelompok') return null;

    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter kelas berdasarkan kelompok pengguna
    const userKelas = kelas.filter(k => k.kelompok === currentUser.kelompok);
    const userClassIds = userKelas.map(k => k.id);
    
    // Filter generus berdasarkan kelas pengguna
    const userGenerus = generusData.filter(g => 
      userKelas.some(k => k.studentIds?.includes(g.id))
    );
    
    // Filter attendance dan grades berdasarkan kelas dan generus pengguna
    const userAttendance = attendance.filter(a => 
      userClassIds.includes(a.classId) && 
      userGenerus.some(g => g.id === a.studentId)
    );
    
    const userGrades = grades.filter(g => 
      userClassIds.includes(g.classId) && 
      userGenerus.some(gen => gen.id === g.studentId)
    );

    // Hitung statistik untuk setiap generus
    const studentStats = userGenerus.map(student => {
      // Kehadiran Kumulatif dalam semester ini
      const studentAttendance = userAttendance.filter(a => 
        a.studentId === student.id && 
        a.year === currentYear && 
        months.indexOf(a.month) <= currentMonthIndex
      );
      
      const totalAttended = studentAttendance.reduce((sum, a) => sum + a.meetingsAttended, 0);
      const totalHeld = studentAttendance.reduce((sum, a) => sum + a.meetingsHeld, 0);
      const attendancePercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 100;

      // Target Materi Kumulatif dalam semester ini
      const allMonthsSoFar = months.slice(0, currentMonthIndex + 1);
      const cumulativeTargetMaterials = materials.filter(m => {
        const targetBulan = Array.isArray(m.targetBulan) ? m.targetBulan : 
                           typeof m.targetBulan === 'string' ? [m.targetBulan] : [];
        return m.kelas === student.pendidikan && 
               targetBulan.some(b => allMonthsSoFar.includes(b));
      });
      
      const studentGrades = userGrades.filter(g => 
        g.studentId === student.id && 
        g.year === currentYear && 
        months.indexOf(g.month) <= currentMonthIndex && 
        g.grade === 'Tercapai'
      );
      
      const achievedMaterialIds = new Set(studentGrades.map(g => g.materialId));
      const totalPossibleCount = cumulativeTargetMaterials.length;
      const achievedCount = achievedMaterialIds.size;
      const targetPercentage = totalPossibleCount > 0 ? Math.round((achievedCount / totalPossibleCount) * 100) : 100;

      return { 
        name: student.name, 
        attendancePercentage, 
        targetPercentage 
      };
    });

    // Ambil 5 generus dengan kehadiran terendah
    const lowAttendanceStudents = studentStats
      .filter(s => s.attendancePercentage < 100)
      .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
      .slice(0, 5)
      .map(s => ({ name: s.name, stat: s.attendancePercentage }));

    // Ambil 5 generus dengan pencapaian target terendah
    const behindTargetStudents = studentStats
      .filter(s => s.targetPercentage < 100)
      .sort((a, b) => a.targetPercentage - b.targetPercentage)
      .slice(0, 5)
      .map(s => ({ name: s.name, stat: s.targetPercentage }));

    return { lowAttendanceStudents, behindTargetStudents };
  }, [currentUser, generusData, kelas, attendance, grades, materials]);

  // Filter kelas berdasarkan kelompok pengguna
  const userKelas = useMemo(() => {
    return kelas.filter(k => k.kelompok === currentUser?.kelompok);
  }, [kelas, currentUser]);

  // Check if M5U has been implemented for current month
  const showM5UWarning = isM5UNotImplemented();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser?.name}</h2>
        <p className="text-teal-100">Selamat datang di dasbor Kelompok {currentUser?.kelompok}.</p>
      </div>
      
      {/* Warning for unimplemented M5U */}
      {showM5UWarning && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Peringatan M5U</AlertTitle>
          <AlertDescription>
            Agenda M5U untuk bulan ini belum dilaksanakan. Silakan tambahkan agenda M5U di menu Laporan {'>'} M5U.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Total Generus" value={stats.generus} icon={GraduationCap} />
        <DashboardStatCard title="Total Kelas" value={userKelas.length} icon={School} />
        <DashboardStatCard title="Total Guru" value={stats.gurus} icon={Contact} />
        <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
      </div>
      
      <div className="mb-6">
        <AnnouncementCard announcements={visibleAnnouncements} />
      </div>
      
      {priorityStudents && (
        <PrioritasGenerusCard 
          lowAttendanceStudents={priorityStudents.lowAttendanceStudents}
          behindTargetStudents={priorityStudents.behindTargetStudents}
        />
      )}
      
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