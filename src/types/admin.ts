export interface Generus {
  id: number;
  name: string;
  kelas: string;
  sekolah: string;
  status: 'Aktif' | 'Non-aktif';
}

export interface Material {
  id: number;
  title: string;
  description: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Attendance {
  id: number;
  studentName: string;
  date: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
}