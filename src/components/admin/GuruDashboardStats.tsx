import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, TrendingUp, Users, School } from 'lucide-react';
import { Kelas, Generus, MonthlyAttendance, Material, Grade } from '@/types/admin';

interface GuruDashboardStatsProps {
  kelas: Kelas[];
  generusData: Generus[];
  attendance: MonthlyAttendance[];
  materials: Material[];
  grades: Grade[];
}

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const GuruDashboardStats: React.FC<GuruDashboardStatsProps> = ({ 
  kelas, 
  generusData, 
  attendance, 
  materials, 
  grades 
}) => {
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonth = months[currentMonthIndex];

  const stats = useMemo(() => {
    // Calculate class progress for current month
    const kelasProgress = kelas.map(k => {
      const studentsInClass = generusData.filter(g => k.studentIds?.includes(g.id));
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

    // Calculate overall attendance rate
    const allStudentAttendance = attendance.filter(a => 
      a.year === currentYear && 
      months.indexOf(a.month) === currentMonthIndex
    );
    
    const totalAttended = allStudentAttendance.reduce((sum, a) => sum + a.meetingsAttended, 0);
    const totalHeld = allStudentAttendance.reduce((sum, a) => sum + a.meetingsHeld, 0);
    const overallAttendanceRate = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

    // Calculate overall material achievement rate
    const allMonthsSoFar = months.slice(0, currentMonthIndex + 1);
    const cumulativeTargetMaterials = materials.filter(m => 
      generusData.some(s => s.pendidikan === m.kelas) && 
      m.targetBulan.some(b => allMonthsSoFar.includes(b))
    );
    
    const allAchievedGrades = grades.filter(g => 
      g.year === currentYear && 
      months.indexOf(g.month) <= currentMonthIndex && 
      g.grade === 'Tercapai'
    );
    
    const totalPossibleCount = generusData.length * cumulativeTargetMaterials.length;
    const overallAchievementRate = totalPossibleCount > 0 ? Math.round((allAchievedGrades.length / totalPossibleCount) * 100) : 0;

    return {
      kelasProgress,
      overallAttendanceRate,
      overallAchievementRate
    };
  }, [kelas, generusData, attendance, materials, grades, currentMonth, currentYear, currentMonthIndex]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kelas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelas.length}</div>
            <p className="text-xs text-muted-foreground">kelas yang diajar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generus</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generusData.length}
            </div>
            <p className="text-xs text-muted-foreground">siswa binaan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kehadiran Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallAttendanceRate}%</div>
            <Progress value={stats.overallAttendanceRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pencapaian Materi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallAchievementRate}%</div>
            <Progress value={stats.overallAchievementRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Kelas Bulan {currentMonth}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.kelasProgress.map((kelas) => (
            <Card key={kelas.namaKelas}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{kelas.namaKelas}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{kelas.jumlahGenerus} Generus</span>
                  <span>{kelas.progress}%</span>
                </div>
                <Progress value={kelas.progress} className="w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuruDashboardStats;