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
  | 'latihan-asad'
  | 'jariyah-ppg'
  | 'pengumuman'
  | 'akses-fitur'
  | 'pengaturan';

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
      { id: 'm5u', label: 'M5U', icon: Megaphone, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'm5u' },
      { id: 'cari-hasil-m5u', label: 'Cari Hasil M5U', icon: Search, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru'], featureId: 'cari-hasil-m5u' },
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
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: Settings,
    roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'],
    children: [
      { id: 'akses-fitur', label: 'Akses Fitur', icon: Shield, roles: ['adminsuper'], featureId: 'akses-fitur' },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'], featureId: 'pengaturan' },
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
  m5u: 'M5U',
  'cari-hasil-m5u': 'Cari Hasil M5U',
  'latihan-asad': 'Latihan ASAD',
  'jariyah-ppg': 'Jariyah PPG',
  pengumuman: 'Pengumuman',
  'akses-fitur': 'Akses Fitur',
  pengaturan: 'Pengaturan',
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
