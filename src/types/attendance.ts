export interface Attendance {
  id: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
  desa: string;
  kelompok: string;
}

export interface MonthlyAttendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  guruId: string;
  desa: string;
  kelompok: string;
  year: number;
  month: string;
  meetingsHeld: number;
  meetingsAttended: number;
}
