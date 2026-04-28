import React, { useMemo, useState } from 'react';
import { MonthlyAttendance, Desa, Generus, getJenjangUsia, User, JENJANG_USIA_LIST, Kelas } from '@/types/admin';
import AttendanceFilters from './AttendanceFilters';
import JenjangSummary from './JenjangSummary';
import AdminDesaView from './AdminDesaView';
import RestrictedView from './RestrictedView';
import AttendanceDetailDialog from './AttendanceDetailDialog';

interface AttendanceSectionProps {
  attendance: MonthlyAttendance[];
  desas: Desa[];
  generusData: Generus[];
  kelas: Kelas[];
  startMonth: string;
  setStartMonth: (month: string) => void;
  startYear: string;
  setStartYear: (year: string) => void;
  endMonth: string;
  setEndMonth: (month: string) => void;
  endYear: string;
  setEndYear: (year: string) => void;
  currentUser: User | null;
}

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];
const monthMap = Object.fromEntries(months.map(m => [m.label, m.value]));

type SummaryData = {
  [key: string]: { attended: number; held: number };
};

export default function AttendanceSection({
  attendance, desas, generusData, kelas, startMonth, setStartMonth, startYear, setStartYear,
  endMonth, setEndMonth, endYear, setEndYear, currentUser
}: AttendanceSectionProps) {

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Kelas | null>(null);

  const isRestrictedRole = currentUser?.role === 'kelompok' || currentUser?.role === 'guru';

  const filteredAttendance = useMemo(() => {
    const startDateNum = parseInt(startYear + startMonth, 10);
    const endDateNum = parseInt(endYear + endMonth, 10);
    return attendance.filter(a => {
      const recordMonthNum = parseInt(a.year + (monthMap[a.month] || '00'), 10);
      return recordMonthNum >= startDateNum && recordMonthNum <= endDateNum;
    });
  }, [attendance, startMonth, startYear, endMonth, endYear]);

  const summaryData = useMemo(() => {
    const generusMap = new Map(generusData.map(g => [g.id, g]));

    if (isRestrictedRole) {
      const restrictedSummary: SummaryData = {};
      filteredAttendance.forEach(record => {
        if (!restrictedSummary[record.classId]) {
          restrictedSummary[record.classId] = { attended: 0, held: 0 };
        }
        restrictedSummary[record.classId].attended += record.meetingsAttended;
        restrictedSummary[record.classId].held += record.meetingsHeld;
      });
      return restrictedSummary;
    }

    // Admin/Desa view
    const adminSummary: Record<string, SummaryData> = {};
    filteredAttendance.forEach(record => {
      const { desa } = record;
      const student = generusMap.get(record.studentId);
      if (student) {
        const jenjang = getJenjangUsia(student.pendidikan);
        if (jenjang !== '-') {
          if (!adminSummary[desa]) adminSummary[desa] = {};
          if (!adminSummary[desa][jenjang]) adminSummary[desa][jenjang] = { attended: 0, held: 0 };
          
          adminSummary[desa][jenjang].attended += record.meetingsAttended;
          adminSummary[desa][jenjang].held += record.meetingsHeld;
        }
      }
    });
    return adminSummary;

  }, [filteredAttendance, generusData, isRestrictedRole]);

  const jenjangUsiaSummary = useMemo(() => {
    if (currentUser?.role !== 'kelompok') return [];

    const summary: { [key: string]: { attended: number; held: number } } = {};
    JENJANG_USIA_LIST.forEach(j => {
      summary[j] = { attended: 0, held: 0 };
    });

    const kelasMap = new Map(kelas.map(k => [k.id, k.jenjangUsia]));

    filteredAttendance.forEach(record => {
      const jenjang = kelasMap.get(record.classId);
      if (jenjang && summary[jenjang]) {
        summary[jenjang].attended += record.meetingsAttended;
        summary[jenjang].held += record.meetingsHeld;
      }
    });

    return Object.entries(summary).map(([name, stats]) => ({
      name,
      ...stats,
      percentage: stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0,
    }));
  }, [filteredAttendance, kelas, currentUser]);

  const detailData = useMemo(() => {
    if (!selectedClass) return [];
    const studentSummary: { [studentId: string]: { name: string, attended: number, held: number } } = {};
    
    const attendanceForClass = filteredAttendance.filter(a => a.classId === selectedClass.id);
    
    attendanceForClass.forEach(record => {
      if (!studentSummary[record.studentId]) {
        studentSummary[record.studentId] = { name: record.studentName, attended: 0, held: 0 };
      }
      studentSummary[record.studentId].attended += record.meetingsAttended;
      studentSummary[record.studentId].held += record.meetingsHeld;
    });

    return Object.values(studentSummary);
  }, [selectedClass, filteredAttendance]);

  const handleViewDetails = (k: Kelas) => {
    setSelectedClass(k);
    setIsDetailOpen(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Rekap Kehadiran Per Kelas</h2>
      <AttendanceFilters
        startMonth={startMonth}
        setStartMonth={setStartMonth}
        startYear={startYear}
        setStartYear={setStartYear}
        endMonth={endMonth}
        setEndMonth={setEndMonth}
        endYear={endYear}
        setEndYear={setEndYear}
      />

      {currentUser?.role === 'kelompok' && (
        <JenjangSummary jenjangUsiaSummary={jenjangUsiaSummary} />
      )}

      {isRestrictedRole ? (
        <RestrictedView
          summaryData={summaryData as any}
          kelas={kelas}
          currentUser={currentUser}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <AdminDesaView
          desas={desas}
          summaryData={summaryData as any}
        />
      )}

      <AttendanceDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        selectedClass={selectedClass}
        detailData={detailData}
      />
    </div>
  );
}