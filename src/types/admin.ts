export interface Generus {
  id: string;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  pendidikan: Pendidikan;
  statusMondok: StatusMondok;
  namaAyah: string;
  statusAyah: 'jm' | 'hum' | '';
  namaIbu: string;
  statusIbu: 'jm' | 'hum' | '';
  desa: string;
  kelompok: string;
}

export const PENDIDIKAN_LIST = [
  'Belum sekolah',
  'Paud/TK',
  'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6',
  'SMP 1', 'SMP 2', 'SMP 3',
  'SMA 1', 'SMA 2', 'SMA 3',
  'Lulus Sekolah',
  'MAHASISWA',
  'Lulus S1', 'Lulus S2', 'Lulus S3'
] as const;
export type Pendidikan = typeof PENDIDIKAN_LIST[number];

export const KELAS_MATERI_LIST = [
  'Paud/TK',
  'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6',
  'SMP 1', 'SMP 2', 'SMP 3',
  'SMA 1', 'SMA 2', 'SMA 3',
] as const;
export type KelasMateri = typeof KELAS_MATERI_LIST[number];

export const JENJANG_USIA_LIST = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'] as const;
export type JenjangUsia = typeof JENJANG_USIA_LIST[number];

export const getJenjangUsia = (pendidikan: Pendidikan): JenjangUsia | '-' => {
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

export const STATUS_MONDOK_LIST = [
  'Boarding school di Samarinda',
  'Boarding school di luar Samarinda',
  'Mubaligh/Mubalighot',
  'Tidak Sedang Mondok',
  'Hadis Besar'
] as const;
export type StatusMondok = typeof STATUS_MONDOK_LIST[number];

export const GENERUS_FILTER_FIELDS = [
    { value: 'name', label: 'Nama Generus' },
    { value: 'tahunLahir', label: 'Tahun Lahir' },
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'jenjangUsia', label: 'Jenjang Usia' },
    { value: 'statusMondok', label: 'Status Mondok' },
    { value: 'desa', label: 'Desa' },
    { value: 'kelompok', label: 'Kelompok' },
    { value: 'namaAyah', label: 'Nama Ayah' },
    { value: 'namaIbu', label: 'Nama Ibu' },
] as const;

export const JUDUL_MATERI_LIST = [
  'Hafalan Al-Quran',
  "Hafalan Do'a",
  'Hafalan Dalil',
  'Praktik Ibadah',
  'Keilmuan dan Kefahaman',
  'Akhlaq',
  'Tata Krama',
  'Kemandirian'
] as const;
export type JudulMateri = typeof JUDUL_MATERI_LIST[number];

export interface Material {
  id: string;
  judulMateri: JudulMateri;
  rincianMateri: string;
  kelas: KelasMateri;
  semester: 'Ganjil' | 'Genap';
  targetBulan: string[];
}

export const SEMESTER_GANJIL_MONTHS = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] as const;
export const SEMESTER_GENAP_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'] as const;

export const ROLES = ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] as const;
export type Role = typeof ROLES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  desa?: string;
  kelompok?: string;
  password?: string;
}

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

export interface Desa {
    id: string;
    name: string;
}

export interface Kelompok {
    id: string;
    name: string;
    desaId: string;
    desaName: string;
}

export interface M5U {
  id: string;
  bulan: string;
  tahun: number;
  agenda: string;
  hasil: string;
  pj: string;
  waktuPelaksanaan: string;
  statusHasil: 'Terlaksana' | 'Dalam Proses' | 'Belum Terlaksana' | 'Mansuh' | '';
}

export const GURU_STATUS_LIST = ['MT', 'MS', 'Asisten Pengajar'] as const;
export type GuruStatus = typeof GURU_STATUS_LIST[number];

export interface Guru {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: GuruStatus;
  phone: string;
  desa: string;
  kelompok: string;
  password?: string;
}

export interface Kelas {
  id: string;
  namaKelas: string;
  guruId: string;
  guruName: string;
  jenjangUsia: JenjangUsia;
  desa: string;
  kelompok: string;
  studentIds: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  materialId: string;
  judulMateri: string;
  rincianMateri: string;
  month: string;
  year: number;
  grade: string;
  guruId: string;
  desa: string;
  kelompok: string;
}