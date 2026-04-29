import React from 'react';
import { Role } from '@/types/admin';
import {
  LayoutDashboard,
  UserCircle,
  Database,
  Users,
  Home,
  Users2,
  Contact,
  School,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  Edit,
  BookOpen,
  Target,
  FileText,
  Megaphone,
  Search,
  BookMarked,
  Settings,
  Shield,
  Bell,
  ListChecks,
  BarChart3,
  MessagesSquare,
  ClipboardList,
  HelpCircle,
  GitBranch,
} from 'lucide-react';

export type AdminSectionId =
  | 'dashboard'
  | 'profile'
  | 'akun'
  | 'desa'
  | 'kelompok'
  | 'dataguru'
  | 'datakelas'
  | 'generus'
  | 'kehadiran-guru'
  | 'rekap-kelas'
  | 'rekap-siswa'
  | 'input-nilai'
  | 'rekap-nilai'
  | 'target-bulanan'
  | 'rekap-per-kelas'
  | 'detail-pencapaian-kelas'
  | 'm5u'
  | 'cari-hasil-m5u'
  | 'musyawaroh-detail'
  | 'notifikasi'
  | 'latihan-asad'
  | 'jariyah-ppg'
  | 'pengumuman'
  | 'checklist-template'
  | 'checklist-saya'
  | 'checklist-rekap'
  | 'evaluasi-periode'
  | 'evaluasi-semester'
  | 'akses-fitur'
  | 'pengaturan'
  | 'panduan'
  | 'alur-kerja';

type MenuIcon = React.ComponentType<{ className?: string }>;

interface AdminMenuChild {
  id: AdminSectionId;
  label: string;
  icon: MenuIcon;
  roles: Role[];
  featureId?: string;
}

interface AdminMenuGroup {
  id: string;
  label: string;
  icon: MenuIcon;
  roles: Role[];
  children?: AdminMenuChild[];
}

export const ADMIN_MENU_ITEMS: AdminMenuGroup[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
        featureId: 'dashboard',
      },
      {
        id: 'profile',
        label: 'Profil Saya',
        icon: UserCircle,
        roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
        featureId: 'profile',
      },
    ],
  },
  {
    id: 'master',
    label: 'Data Master',
    icon: Database,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok'],
    children: [
      { id: 'akun', label: 'Akun', icon: Users, roles: ['adminsuper', 'admin', 'desa', 'kelompok'], featureId: 'akun' },
      { id: 'desa', label: 'Desa', icon: Home, roles: ['adminsuper', 'admin'], featureId: 'desa' },
      { id: 'kelompok', label: 'Kelompok', icon: Users2, roles: ['adminsuper', 'admin', 'desa'], featureId: 'kelompok' },
      { id: 'dataguru', label: 'Data Guru', icon: Contact, roles: ['adminsuper', 'admin', 'desa', 'kelompok'], featureId: 'dataguru' },
      { id: 'datakelas', label: 'Data Kelas', icon: School, roles: ['adminsuper', 'admin', 'desa', 'kelompok'], featureId: 'datakelas' },
    ],
  },
  {
    id: 'generus-group',
    label: 'Data Generus',
    icon: GraduationCap,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      {
        id: 'generus',
        label: 'Data Generus',
        icon: GraduationCap,
        roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
        featureId: 'generus',
      },
    ],
  },
  {
    id: 'kehadiran',
    label: 'Kehadiran',
    icon: Calendar,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      { id: 'kehadiran-guru', label: 'Input Kehadiran', icon: Calendar, roles: ['guru'], featureId: 'kehadiran-guru' },
      { id: 'rekap-kelas', label: 'Rekap Per Kelas', icon: School, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'rekap-kelas' },
      { id: 'rekap-siswa', label: 'Rekap Per Siswa', icon: Users, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'rekap-siswa' },
    ],
  },
  {
    id: 'nilai',
    label: 'Nilai Generus',
    icon: ClipboardCheck,
    roles: ['guru'],
    children: [
      { id: 'input-nilai', label: 'Input Nilai', icon: Edit, roles: ['guru'], featureId: 'input-nilai' },
      { id: 'rekap-nilai', label: 'Rekap Nilai', icon: BookOpen, roles: ['guru'], featureId: 'rekap-nilai' },
    ],
  },
  {
    id: 'target-materi',
    label: 'Target Materi',
    icon: Target,
    roles: ['adminsuper', 'admin', 'kelompok'],
    children: [
      { id: 'target-bulanan', label: 'Target Bulanan', icon: Target, roles: ['adminsuper', 'admin', 'kelompok'], featureId: 'target-bulanan' },
      { id: 'rekap-per-kelas', label: 'Rekap Per Kelas', icon: BookOpen, roles: ['adminsuper', 'admin', 'kelompok'], featureId: 'rekap-per-kelas' },
    ],
  },
  {
    id: 'laporan',
    label: 'Laporan',
    icon: FileText,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
    children: [
      { id: 'latihan-asad', label: 'Latihan ASAD', icon: BookMarked, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'latihan-asad' },
      { id: 'jariyah-ppg', label: 'Jariyah PPG', icon: BookMarked, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'jariyah-ppg' },
    ],
  },
  {
    id: 'pengumuman-group',
    label: 'Pengumuman',
    icon: Megaphone,
    roles: ['adminsuper', 'admin'],
    children: [
      { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, roles: ['adminsuper', 'admin'], featureId: 'pengumuman' },
    ],
  },
  {
    id: 'musyawaroh-group',
    label: 'Musyawaroh',
    icon: MessagesSquare,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      { id: 'm5u', label: 'Agenda M5U', icon: MessagesSquare, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'm5u' },
      { id: 'cari-hasil-m5u', label: 'Cari Hasil M5U', icon: Search, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'cari-hasil-m5u' },
      { id: 'musyawaroh-detail', label: 'Detail & Absensi', icon: ClipboardCheck, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'musyawaroh-detail' },
      { id: 'notifikasi', label: 'Notifikasi', icon: Bell, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'notifikasi' },
    ],
  },
  {
    id: 'checklist-group',
    label: 'Checklist',
    icon: ListChecks,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'],
    children: [
      { id: 'checklist-template', label: 'Template Checklist', icon: ClipboardList, roles: ['adminsuper', 'admin', 'desa'], featureId: 'checklist-template' },
      { id: 'checklist-saya', label: 'Checklist Saya', icon: ListChecks, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'checklist-saya' },
      { id: 'checklist-rekap', label: 'Rekap Checklist', icon: BarChart3, roles: ['adminsuper', 'admin', 'desa', 'kelompok'], featureId: 'checklist-rekap' },
    ],
  },
  {
    id: 'evaluasi-group',
    label: 'Evaluasi Semesteran',
    icon: BarChart3,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
    children: [
      { id: 'evaluasi-periode', label: 'Periode Evaluasi', icon: Calendar, roles: ['adminsuper', 'admin'], featureId: 'evaluasi-periode' },
      { id: 'evaluasi-semester', label: 'Evaluasi Semester', icon: BarChart3, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'evaluasi-semester' },
    ],
  },
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
    children: [
      { id: 'akses-fitur', label: 'Akses Fitur', icon: Shield, roles: ['adminsuper'], featureId: 'akses-fitur' },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'pengaturan' },
      { id: 'panduan', label: 'Panduan Penggunaan', icon: HelpCircle, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'panduan' },
      { id: 'alur-kerja', label: 'Alur Kerja', icon: GitBranch, roles: ['adminsuper', 'admin'], featureId: 'alur-kerja' },
    ],
  },
];

export const SECTION_LABELS: Record<AdminSectionId, string> = {
  dashboard: 'Dashboard',
  profile: 'Profil Saya',
  akun: 'Akun',
  desa: 'Desa',
  kelompok: 'Kelompok',
  dataguru: 'Data Guru',
  datakelas: 'Data Kelas',
  generus: 'Data Generus',
  'kehadiran-guru': 'Input Kehadiran',
  'rekap-kelas': 'Rekap Per Kelas',
  'rekap-siswa': 'Rekap Per Siswa',
  'input-nilai': 'Input Nilai',
  'rekap-nilai': 'Rekap Nilai',
  'target-bulanan': 'Target Bulanan',
  'rekap-per-kelas': 'Rekap Per Kelas',
  'detail-pencapaian-kelas': 'Detail Pencapaian Kelas',
  m5u: 'Agenda M5U',
  'cari-hasil-m5u': 'Cari Hasil M5U',
  'musyawaroh-detail': 'Detail & Absensi Musyawaroh',
  'notifikasi': 'Notifikasi',
  'latihan-asad': 'Latihan ASAD',
  'jariyah-ppg': 'Jariyah PPG',
  pengumuman: 'Pengumuman',
  'checklist-template': 'Template Checklist',
  'checklist-saya': 'Checklist Saya',
  'checklist-rekap': 'Rekap Checklist',
  'evaluasi-periode': 'Periode Evaluasi',
  'evaluasi-semester': 'Evaluasi Semesteran',
  'akses-fitur': 'Akses Fitur',
  pengaturan: 'Pengaturan',
  panduan: 'Panduan Penggunaan',
  'alur-kerja': 'Alur Kerja',
};

export function isValidAdminSection(section: string): section is AdminSectionId {
  return section in SECTION_LABELS;
}

export function getAccessibleSections(
  role: Role,
  canAccessFeature?: (featureId: string) => boolean
): AdminSectionId[] {
  const result: AdminSectionId[] = [];

  for (const group of ADMIN_MENU_ITEMS) {
    if (!group.roles.includes(role)) continue;
    for (const child of group.children ?? []) {
      if (!child.roles.includes(role)) continue;
      if (child.featureId && canAccessFeature && !canAccessFeature(child.featureId)) continue;
      result.push(child.id);
    }
  }

  return Array.from(new Set(result));
}
