import { RoleNode, SetupStep, OperationalFlow } from './types';
import {
  Home, Users2, Users, Contact, School, GraduationCap, Target, ListChecks,
  Calendar, ClipboardCheck, BookOpen, Target as TargetIcon, BarChart3,
  MessagesSquare, Edit, Bell, CheckCircle2, Shield,
} from 'lucide-react';

export const ROLE_TREE: RoleNode = {
  role: 'adminsuper',
  label: 'Admin Super',
  color: 'text-red-600 dark:text-red-400',
  bg: 'bg-red-50 dark:bg-red-950/40',
  border: 'border-red-200 dark:border-red-800',
  description: 'Pengelola utama sistem — akses penuh ke seluruh fitur dan pengaturan.',
  features: ['Akses Fitur (toggle permission)', 'Kelola Desa', 'Kelola semua data master', 'Periode Evaluasi'],
  children: [
    {
      role: 'admin',
      label: 'Admin',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-800',
      description: 'Administrator tingkat kota — kelola data master, evaluasi, dan pengumuman.',
      features: ['Kelola Akun & Kelas', 'Periode Evaluasi', 'Pengumuman', 'Publish Evaluasi'],
      children: [
        {
          role: 'desa',
          label: 'PJP Desa',
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800',
          description: 'Penanggung jawab wilayah desa — pantau kelompok, guru, dan generus di desanya.',
          features: ['Kelola Kelompok', 'Template Checklist', 'Rekap Kehadiran', 'Musyawaroh'],
          children: [
            {
              role: 'kelompok',
              label: 'PJP Kelompok',
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-950/40',
              border: 'border-green-200 dark:border-green-800',
              description: 'Penanggung jawab kelompok — kelola kelas, target materi, dan evaluasi di kelompoknya.',
              features: ['Target Bulanan', 'Isi Evaluasi', 'Rekap Pencapaian', 'Checklist Saya'],
              children: [
                {
                  role: 'guru',
                  label: 'Guru',
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-50 dark:bg-purple-950/40',
                  border: 'border-purple-200 dark:border-purple-800',
                  description: 'Pengajar kelas generus — input kehadiran harian, nilai, dan evaluasi.',
                  features: ['Input Kehadiran', 'Input Nilai', 'Isi Evaluasi', 'Laporan ASAD/Jariyah'],
                  children: [
                    {
                      role: 'orangtua',
                      label: 'Orang Tua',
                      color: 'text-teal-600 dark:text-teal-400',
                      bg: 'bg-teal-50 dark:bg-teal-950/40',
                      border: 'border-teal-200 dark:border-teal-800',
                      description: 'Wali generus — lihat laporan kehadiran, nilai, evaluasi, dan pengumuman.',
                      features: ['Lihat Dashboard', 'Lihat Evaluasi', 'Lihat Agenda M5U'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const SETUP_STEPS: SetupStep[] = [
  { number: 1, title: 'Buat Desa', description: 'Tambahkan data wilayah desa sebagai unit tertinggi.', icon: Home, detail: 'Menu: Data Master → Desa → Tambah Desa', actor: 'Admin Super' },
  { number: 2, title: 'Buat Kelompok', description: 'Tambahkan kelompok generus di dalam setiap desa.', icon: Users2, detail: 'Menu: Data Master → Kelompok → Tambah Kelompok', actor: 'Admin Super / Admin' },
  { number: 3, title: 'Tambah Akun Pengguna', description: 'Daftarkan akun Admin, PJP Desa, PJP Kelompok, Guru, dan Orang Tua.', icon: Users, detail: 'Menu: Data Master → Akun → Tambah Akun', actor: 'Admin Super / Admin' },
  { number: 4, title: 'Input Data Guru', description: 'Lengkapi profil guru: nama, desa, kelompok yang ditangani.', icon: Contact, detail: 'Menu: Data Master → Data Guru → Tambah Guru', actor: 'Admin / PJP Desa' },
  { number: 5, title: 'Buat Kelas', description: 'Buat kelas, assign guru pengajar, dan tambahkan generus ke kelas.', icon: School, detail: 'Menu: Data Master → Data Kelas → Tambah Kelas', actor: 'Admin / PJP' },
  { number: 6, title: 'Input Data Generus', description: 'Daftarkan generus (santri) ke dalam sistem dan kelas.', icon: GraduationCap, detail: 'Menu: Data Generus → Tambah / Import Generus', actor: 'Admin / PJP' },
  { number: 7, title: 'Set Target Materi', description: 'PJP Kelompok menetapkan target pencapaian materi bulanan.', icon: Target, detail: 'Menu: Target Materi → Target Bulanan', actor: 'PJP Kelompok' },
  { number: 8, title: 'Buat Template Checklist', description: 'Admin/PJP Desa membuat template checklist tugas rutin.', icon: ListChecks, detail: 'Menu: Checklist → Template Checklist', actor: 'Admin / PJP Desa' },
];

export const OPERATIONAL_FLOWS: OperationalFlow[] = [
  {
    id: 'kehadiran',
    label: 'Kehadiran',
    icon: Calendar,
    steps: [
      { actor: 'Guru', action: 'Input kehadiran harian generus per kelas', icon: Edit, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'PJP Kelompok', action: 'Pantau rekap kehadiran per kelas di kelompoknya', icon: BarChart3, color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' },
      { actor: 'PJP Desa', action: 'Pantau rekap kehadiran seluruh desa', icon: BarChart3, color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' },
      { actor: 'Admin', action: 'Lihat rekap kehadiran lintas wilayah', icon: BarChart3, color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700' },
    ],
  },
  {
    id: 'nilai',
    label: 'Nilai',
    icon: ClipboardCheck,
    steps: [
      { actor: 'Guru', action: 'Input nilai per materi untuk generus di kelasnya', icon: Edit, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'Guru', action: 'Lihat rekap nilai di Rekap Nilai', icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'PJP', action: 'Pantau rekap pencapaian per kelas dibanding target', icon: TargetIcon, color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' },
    ],
  },
  {
    id: 'musyawaroh',
    label: 'Musyawaroh (M5U)',
    icon: MessagesSquare,
    steps: [
      { actor: 'Admin / PJP', action: 'Buat agenda M5U dengan tanggal dan lokasi', icon: MessagesSquare, color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700' },
      { actor: 'Peserta', action: 'Isi absensi kehadiran saat musyawaroh berlangsung', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' },
      { actor: 'Notulis', action: 'Tulis notulensi hasil musyawaroh', icon: Edit, color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' },
      { actor: 'PJP', action: 'Tambah action items dan pantau progressnya', icon: ListChecks, color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' },
      { actor: 'Sistem', action: 'Kirim notifikasi pengingat untuk outstanding items', icon: Bell, color: 'bg-gray-100 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600' },
    ],
  },
  {
    id: 'evaluasi',
    label: 'Evaluasi Semesteran',
    icon: BarChart3,
    steps: [
      { actor: 'Admin', action: 'Buat dan buka periode evaluasi di Periode Evaluasi', icon: Calendar, color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700' },
      { actor: 'Guru / PJP', action: 'Isi evaluasi tiap generus (auto-agregasi data kehadiran & nilai)', icon: Edit, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'Guru / PJP', action: 'Klik "Kirim untuk Review" setelah lengkap', icon: CheckCircle2, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'Admin', action: 'Review dan Publish evaluasi untuk orang tua', icon: Shield, color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700' },
      { actor: 'Orang Tua', action: 'Lihat dan unduh laporan evaluasi (PDF)', icon: BarChart3, color: 'bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700' },
    ],
  },
  {
    id: 'checklist',
    label: 'Checklist Tugas',
    icon: ListChecks,
    steps: [
      { actor: 'Admin / PJP Desa', action: 'Buat template checklist tugas rutin', icon: ListChecks, color: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700' },
      { actor: 'Sistem', action: 'Checklist otomatis di-assign ke guru/PJP yang ditunjuk', icon: Users, color: 'bg-gray-100 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600' },
      { actor: 'Guru / PJP', action: 'Isi dan selesaikan checklist di menu Checklist Saya', icon: CheckCircle2, color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' },
      { actor: 'PJP / Admin', action: 'Pantau completion rate di Rekap Checklist', icon: BarChart3, color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' },
    ],
  },
];
