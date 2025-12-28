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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRoles: Role[];
  createdAt: any; // Firestore Timestamp
}

export const JENIS_LATIHAN_LIST = [
  'Sholat Berjamaah',
  'Tilawah Al-Quran',
  'Puasa Sunnah',
  'Sholat Tahajud',
  'Sholat Dhuha',
  'Dzikir Pagi/Petang',
  'Sedekah',
  'Membaca Buku Islami',
  'Menghafal Al-Quran',
  'Lainnya'
] as const;
export type JenisLatihan = typeof JENIS_LATIHAN_LIST[number];

export interface LatihanASAD {
  id: string;
  generusId: string;
  generusName: string;
  jenisLatihan: JenisLatihan;
  tanggal: string; // YYYY-MM-DD
  bulan: string;
  tahun: number;
  keterangan: string;
  status: 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses';
  desa: string;
  kelompok: string;
  createdBy: string;
}

export const JENIS_JARIYAH_LIST = [
  'Infaq Bulanan',
  'Sedekah',
  'Wakaf',
  'Zakat Maal',
  'Zakat Fitrah',
  'Donasi Pembangunan',
  'Donasi Kegiatan',
  'Lainnya'
] as const;
export type JenisJariyah = typeof JENIS_JARIYAH_LIST[number];

export interface JariyahPPG {
  id: string;
  donaturName: string;
  donaturType: 'Generus' | 'Orang Tua' | 'Umum';
  generusId?: string;
  jenisJariyah: JenisJariyah;
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  bulan: string;
  tahun: number;
  keterangan: string;
  status: 'Diterima' | 'Pending' | 'Ditolak';
  desa: string;
  kelompok: string;
  createdBy: string;
}

// ===================== FEATURE PERMISSIONS =====================
export interface FeaturePermission {
  id: string;
  featureId: string;
  featureName: string;
  description: string;
  category: 'dashboard' | 'master' | 'data' | 'kehadiran' | 'nilai' | 'laporan' | 'pengumuman' | 'lainnya';
  allowedRoles: Role[];
  isEnabled: boolean;
  isCore: boolean; // If true, cannot be disabled (e.g., Dashboard, Profile)
}

export const FEATURE_LIST: Omit<FeaturePermission, 'id'>[] = [
  // Dashboard & Profile
  { featureId: 'dashboard', featureName: 'Dashboard', description: 'Halaman utama dashboard', category: 'dashboard', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: true },
  { featureId: 'profile', featureName: 'Profil Saya', description: 'Melihat dan edit profil', category: 'dashboard', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: true },

  // Data Master
  { featureId: 'akun', featureName: 'Data Akun', description: 'Kelola akun pengguna', category: 'master', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok'], isEnabled: true, isCore: false },
  { featureId: 'desa', featureName: 'Data Desa', description: 'Kelola data desa', category: 'master', allowedRoles: ['adminsuper', 'admin'], isEnabled: true, isCore: false },
  { featureId: 'kelompok', featureName: 'Data Kelompok', description: 'Kelola data kelompok', category: 'master', allowedRoles: ['adminsuper', 'admin', 'desa'], isEnabled: true, isCore: false },
  { featureId: 'dataguru', featureName: 'Data Guru', description: 'Kelola data guru', category: 'master', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok'], isEnabled: true, isCore: false },
  { featureId: 'datakelas', featureName: 'Data Kelas', description: 'Kelola data kelas', category: 'master', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok'], isEnabled: true, isCore: false },

  // Data Generus
  { featureId: 'generus', featureName: 'Data Generus', description: 'Kelola data generus/siswa', category: 'data', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },

  // Kehadiran
  { featureId: 'kehadiran-guru', featureName: 'Input Kehadiran', description: 'Input data kehadiran', category: 'kehadiran', allowedRoles: ['guru'], isEnabled: true, isCore: false },
  { featureId: 'rekap-kelas', featureName: 'Rekap Per Kelas', description: 'Rekap kehadiran per kelas', category: 'kehadiran', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },
  { featureId: 'rekap-siswa', featureName: 'Rekap Per Siswa', description: 'Rekap kehadiran per siswa', category: 'kehadiran', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },

  // Nilai
  { featureId: 'input-nilai', featureName: 'Input Nilai', description: 'Input nilai generus', category: 'nilai', allowedRoles: ['guru'], isEnabled: true, isCore: false },
  { featureId: 'rekap-nilai', featureName: 'Rekap Nilai', description: 'Rekap nilai generus', category: 'nilai', allowedRoles: ['guru'], isEnabled: true, isCore: false },

  // Target Materi
  { featureId: 'target-bulanan', featureName: 'Target Bulanan', description: 'Kelola target materi bulanan', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'kelompok'], isEnabled: true, isCore: false },
  { featureId: 'rekap-per-kelas', featureName: 'Rekap Per Kelas (Materi)', description: 'Rekap pencapaian materi', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'kelompok'], isEnabled: true, isCore: false },

  // Laporan
  { featureId: 'm5u', featureName: 'M5U', description: 'Laporan M5U', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: false },
  { featureId: 'cari-hasil-m5u', featureName: 'Cari Hasil M5U', description: 'Pencarian hasil M5U', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },
  { featureId: 'latihan-asad', featureName: 'Latihan ASAD', description: 'Laporan latihan ASAD', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },
  { featureId: 'jariyah-ppg', featureName: 'Jariyah PPG', description: 'Laporan kontribusi jariyah', category: 'laporan', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },

  // Pengumuman
  { featureId: 'pengumuman', featureName: 'Pengumuman', description: 'Kelola pengumuman', category: 'pengumuman', allowedRoles: ['adminsuper', 'admin'], isEnabled: true, isCore: false },
];

export const FEATURE_CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard & Profil' },
  { id: 'master', name: 'Data Master' },
  { id: 'data', name: 'Data Generus' },
  { id: 'kehadiran', name: 'Kehadiran' },
  { id: 'nilai', name: 'Nilai' },
  { id: 'laporan', name: 'Laporan & Target' },
  { id: 'pengumuman', name: 'Pengumuman' },
] as const;