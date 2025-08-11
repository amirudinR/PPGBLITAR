export interface Generus {
  id: string;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  namaAyah: string;
  namaIbu: string;
  desa: string;
  kelompok: string;
}

export const JENIS_MATERI = [
  'Materi bacaan', 
  'Makna/Menulis', 
  'Hafalan', 
  'Praktek Ibadah', 
  'Keilmuan dan Kefahaman', 
  'Tatakrama', 
  'Kemandirian'
] as const;

export type JenisMateri = typeof JENIS_MATERI[number];

export interface Material {
  id: string;
  jenisMateri: JenisMateri;
  rincianMateri: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap';
  bulan: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Attendance {
  id: string;
  studentName: string;
  date: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
}