export interface Generus {
  id: string;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  namaAyah: string;
  statusAyah: 'jm' | 'hum' | '';
  namaIbu: string;
  statusIbu: 'jm' | 'hum' | '';
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

export const KELAS_LIST = [
  'Paud/TK', 'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6'
] as const;
export type Kelas = typeof KELAS_LIST[number];

export const SEMESTER_GANJIL_MONTHS = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] as const;
export const SEMESTER_GENAP_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'] as const;

export interface Material {
  id: string;
  jenisMateri: JenisMateri;
  rincianMateri: string;
  kelas: Kelas;
  semester: 'Ganjil' | 'Genap';
  bulan: string;
}

export const ROLES = ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] as const;
export type Role = typeof ROLES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
}

export interface Attendance {
  id: string;
  studentName: string;
  date: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
}