import React, { useMemo } from 'react';
import DashboardStatCard from './DashboardStatCard';
import GenderChart from './GenderChart';
import FilteredGenerusTable from './FilteredGenerusTable';
import AttendanceChart from './AttendanceChart';
import { GraduationCap, Home, Users2, Users, Contact } from 'lucide-react';
import { Generus, Pendidikan, User, MonthlyAttendance } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DashboardSectionProps {
  stats: {
    generus: number;
    desa: number;
    kelompok: number;
    users: number;
    gurus: number;
  };
  generusData: Generus[];
  attendanceData: MonthlyAttendance[];
  dashboardFilterCategory: string;
  setDashboardFilterCategory: (value: string) => void;
  dashboardFilterValue: string;
  setDashboardFilterValue: (value: string) => void;
  jenjangUsiaFilter: string[];
  setJenjangUsiaFilter: (value: string[]) => void;
  currentUser: User | null;
  attendanceMonth: string;
  setAttendanceMonth: (value: string) => void;
  attendanceYear: string;
  setAttendanceYear: (value: string) => void;
}

const filterCategories = [
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'desa', label: 'Desa' },
    { value: 'kelompok', label: 'Kelompok' },
    { value: 'statusMondok', label: 'Status Mondok' },
];

const jenjangUsiaOptions = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'];

const getJenjangUsia = (pendidikan: Pendidikan): string => {
  switch (pendidikan) {
    case 'Belum sekolah': case 'Paud/TK': case 'SD 1': case 'SD 2': case 'SD 3': case 'SD 4': case 'SD 5': case 'SD 6':
      return 'Caberawit';
    case 'SMP 1': case 'SMP 2': case 'SMP 3':
      return 'Pra Remaja';
    case 'SMA 1': case 'SMA 2': case 'SMA 3':
      return 'Remaja';
    case 'Lulus Sekolah': case 'MAHASISWA': case 'Lulus S1': case 'Lulus S2': case 'Lulus S3':
      return 'Pra Nikah';
    default:
      return '-';
  }
};

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];

export default function DashboardSection({ 
    stats, 
    generusData, 
    attendanceData,
    dashboardFilterCategory, 
    setDashboardFilterCategory, 
    dashboardFilterValue, 
    setDashboardFilterValue,
    jenjangUsiaFilter,
    setJenjangUsiaFilter,
    currentUser,
    attendanceMonth,
    setAttendanceMonth,
    attendanceYear,
    setAttendanceYear,
}: DashboardSectionProps) {

  const valueOptions = useMemo(() => {
    if (!dashboardFilterCategory) return [];
    const uniqueValues = [...new Set(generusData.map(g => g[dashboardFilterCategory as keyof Generus]))];
    return ['Semua', ...uniqueValues.map(String).sort()];
  }, [generusData, dashboardFilterCategory]);

  const filteredGenerus = useMemo(() => {
    let result = generusData;

    if (dashboardFilterValue && dashboardFilterValue !== 'Semua') {
      result = result.filter(g => String(g[dashboardFilterCategory as keyof Generus]) === dashboardFilterValue);
    }

    if (jenjangUsiaFilter.length > 0) {
      result = result.filter(g => jenjangUsiaFilter.includes(getJenjangUsia(g.pendidikan)));
    }

    return result;
  }, [generusData, dashboardFilterCategory, dashboardFilterValue, jenjangUsiaFilter]);

  const genderData = useMemo(() => {
    const dataToUse = filteredGenerus;
    const lakiLaki = dataToUse.filter(g => g.jenisKelamin === 'Laki-laki').length;
    const perempuan = dataToUse.filter(g => g.jenisKelamin === 'Perempuan').length;
    return [
      { name: 'Laki-laki', value: lakiLaki },
      { name: 'Perempuan', value: perempuan },
    ];
  }, [filteredGenerus]);

  const attendancePercentage = useMemo(() => {
    const monthLabel = months.find(m => m.value === attendanceMonth)?.label;
    const filtered = attendanceData.filter(a => a.month === monthLabel && a.year === parseInt(attendanceYear));
    const totalAttended = filtered.reduce((sum, record) => sum + record.meetingsAttended, 0);
    const totalHeld = filtered.reduce((sum, record) => sum + record.meetingsHeld, 0);
    return totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;
  }, [attendanceData, attendanceMonth, attendanceYear]);

  const handleCategoryChange = (value: string) => {
    setDashboardFilterCategory(value);
    setDashboardFilterValue('Semua');
  };

  const handleJenjangUsiaChange = (jenjang: string, checked: boolean | 'indeterminate') => {
    if (checked) {
      setJenjangUsiaFilter([...jenjangUsiaFilter, jenjang]);
    } else {
      setJenjangUsiaFilter(jenjangUsiaFilter.filter(j => j !== jenjang));
    }
  };

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
        ) : (
          <>
            <DashboardStatCard title="Total Desa" value={stats.desa} icon={Home} />
            <DashboardStatCard title="Total Kelompok" value={stats.kelompok} icon={Users2} />
            <DashboardStatCard title="Total Pengguna" value={stats.users} icon={Users} />
          </>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
        {currentUser?.role === 'kelompok' ? (
          <AttendanceChart 
            percentage={attendancePercentage}
            month={attendanceMonth}
            setMonth={setAttendanceMonth}
            year={attendanceYear}
            setYear={setAttendanceYear}
          />
        ) : (
          <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filter Generus</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  <Select value={dashboardFilterCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filterCategories.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dashboardFilterValue} onValueChange={setDashboardFilterValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Nilai..." />
                    </SelectTrigger>
                    <SelectContent>
                      {valueOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Filter Jenjang Usia</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-x-6 gap-y-4">
                      {jenjangUsiaOptions.map(option => (
                          <div key={option} className="flex items-center space-x-2">
                              <Checkbox 
                                  id={option} 
                                  checked={jenjangUsiaFilter.includes(option)}
                                  onCheckedChange={(checked) => handleJenjangUsiaChange(option, checked)}
                              />
                              <Label htmlFor={option}>{option}</Label>
                          </div>
                      ))}
                  </CardContent>
              </Card>
          </div>
        )}
        <GenderChart data={genderData} />
      </div>
      <FilteredGenerusTable generus={filteredGenerus} />
    </div>
  );
}