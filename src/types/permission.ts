import { Role } from './user';

export interface FeaturePermission {
  id: string;
  featureId: string;
  featureName: string;
  description: string;
  category: 'dashboard' | 'master' | 'data' | 'kehadiran' | 'nilai' | 'laporan' | 'pengumuman' | 'musyawaroh' | 'checklist' | 'evaluasi' | 'lainnya';
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

  // Musyawaroh
  { featureId: 'musyawaroh-detail', featureName: 'Detail Musyawaroh', description: 'Platform musyawaroh terintegrasi (absensi, notulensi, action items)', category: 'musyawaroh', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },
  { featureId: 'notifikasi', featureName: 'Notifikasi', description: 'Notifikasi in-app dan pengingat outstanding', category: 'musyawaroh', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: false },

  // Checklist
  { featureId: 'checklist-template', featureName: 'Template Checklist', description: 'Kelola template checklist guru/PJP', category: 'checklist', allowedRoles: ['adminsuper', 'admin', 'desa'], isEnabled: true, isCore: false },
  { featureId: 'checklist-saya', featureName: 'Checklist Saya', description: 'Isi checklist yang di-assign ke saya', category: 'checklist', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], isEnabled: true, isCore: false },
  { featureId: 'checklist-rekap', featureName: 'Rekap Checklist', description: 'Rekap completion rate checklist', category: 'checklist', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok'], isEnabled: true, isCore: false },

  // Evaluasi Semesteran
  { featureId: 'evaluasi-periode', featureName: 'Periode Evaluasi', description: 'Buka/tutup periode evaluasi semesteran', category: 'evaluasi', allowedRoles: ['adminsuper', 'admin'], isEnabled: true, isCore: false },
  { featureId: 'evaluasi-semester', featureName: 'Evaluasi Semesteran', description: 'Input dan review evaluasi semesteran generus', category: 'evaluasi', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: false },

  { featureId: 'pengaturan', featureName: 'Pengaturan', description: 'Pengaturan preferensi aplikasi', category: 'lainnya', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: false },
  { featureId: 'panduan', featureName: 'Panduan Penggunaan', description: 'Panduan cara menggunakan setiap fitur sesuai peran', category: 'lainnya', allowedRoles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], isEnabled: true, isCore: true },
  { featureId: 'alur-kerja', featureName: 'Alur Kerja', description: 'Struktur hierarki, setup awal, dan alur operasional aplikasi', category: 'lainnya', allowedRoles: ['adminsuper', 'admin'], isEnabled: true, isCore: true },
];

export const FEATURE_CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard & Profil' },
  { id: 'master', name: 'Data Master' },
  { id: 'data', name: 'Data Generus' },
  { id: 'kehadiran', name: 'Kehadiran' },
  { id: 'nilai', name: 'Nilai' },
  { id: 'laporan', name: 'Laporan & Target' },
  { id: 'pengumuman', name: 'Pengumuman' },
  { id: 'musyawaroh', name: 'Musyawaroh' },
  { id: 'checklist', name: 'Checklist' },
  { id: 'evaluasi', name: 'Evaluasi Semesteran' },
  { id: 'lainnya', name: 'Lainnya' },
] as const;
