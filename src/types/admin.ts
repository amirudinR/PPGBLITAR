export interface Generus {
  id: number;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  namaAyah: string;
  namaIbu: string;
  desa: string;
  kelompok: string;
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