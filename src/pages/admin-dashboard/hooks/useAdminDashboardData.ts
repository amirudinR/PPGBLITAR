import { User } from '@/types/admin';
import { useDesa } from '@/hooks/useDesa';
import { useKelompok } from '@/hooks/useKelompok';
import { useGenerus } from '@/hooks/useGenerus';
import { useUsers } from '@/hooks/useUsers';
import { useMaterials } from '@/hooks/useMaterials';
import { useAttendance } from '@/hooks/useAttendance';
import { useGurus } from '@/hooks/useGurus';
import { useKelas } from '@/hooks/useKelas';
import { useAuthManagement } from '@/hooks/useAuthManagement';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useGrades } from '@/hooks/useGrades';
import { useEffect } from 'react';
import { AdminSectionId } from '@/config/adminSections';

interface UseAdminDashboardDataParams {
  currentUser: User | null;
  activeSection: AdminSectionId;
}

const GENERUS_SECTIONS: AdminSectionId[] = [
  'dashboard',
  'generus',
  'datakelas',
  'rekap-kelas',
  'rekap-siswa',
  'kehadiran-guru',
  'input-nilai',
  'rekap-nilai',
  'latihan-asad',
  'jariyah-ppg',
  'detail-pencapaian-kelas',
];

const GURUS_SECTIONS: AdminSectionId[] = ['dashboard', 'dataguru', 'datakelas', 'kehadiran-guru'];

const KELAS_SECTIONS: AdminSectionId[] = [
  'dashboard',
  'datakelas',
  'rekap-kelas',
  'rekap-siswa',
  'kehadiran-guru',
  'input-nilai',
  'rekap-nilai',
  'target-bulanan',
  'rekap-per-kelas',
  'detail-pencapaian-kelas',
];

const ATTENDANCE_SECTIONS: AdminSectionId[] = ['dashboard', 'rekap-kelas', 'rekap-siswa', 'kehadiran-guru'];
const GRADES_SECTIONS: AdminSectionId[] = ['dashboard', 'input-nilai', 'rekap-nilai', 'rekap-per-kelas', 'detail-pencapaian-kelas'];
const MATERIALS_SECTIONS: AdminSectionId[] = ['dashboard', 'input-nilai', 'rekap-nilai', 'target-bulanan', 'rekap-per-kelas', 'detail-pencapaian-kelas'];

export function useAdminDashboardData({ currentUser, activeSection }: UseAdminDashboardDataParams) {
  const { desas, loading: loadingDesa, fetchDesas, addDesa, updateDesa, deleteDesa } = useDesa();
  const { kelompok, loading: loadingKelompok, fetchKelompok, addKelompok, updateKelompok, deleteKelompok } = useKelompok(desas, currentUser);
  const { generus, loading: loadingGenerus, fetchGenerus, newGenerus, setNewGenerus, addGenerus, importGenerus, updateGenerus, deleteGenerus } = useGenerus(currentUser);
  const { users, loading: loadingUsers, fetchUsers, addUser, updateUser, resetUserPassword, deleteUser } = useUsers(currentUser);
  const { materials, loading: loadingMaterials, fetchMaterials } = useMaterials();
  const { attendance, loading: loadingAttendance, fetchAttendance } = useAttendance(currentUser);
  const { gurus, loading: loadingGurus, fetchGurus, addGuru, updateGuru, deleteGuru } = useGurus(currentUser, { onDataChange: fetchUsers });
  const { kelas, loading: loadingKelas, fetchKelas, addKelas, updateKelas, deleteKelas } = useKelas(currentUser);
  const { updateCurrentUserPassword } = useAuthManagement();
  const { announcements, loading: loadingAnnouncements, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(currentUser);
  const { grades, loading: loadingGrades, fetchGrades } = useGrades(currentUser);

  const loading =
    loadingDesa ||
    loadingKelompok ||
    loadingGenerus ||
    loadingUsers ||
    loadingMaterials ||
    loadingAttendance ||
    loadingGurus ||
    loadingKelas ||
    loadingAnnouncements ||
    loadingGrades;

  useEffect(() => {
    if (!currentUser) return;
    fetchDesas();
    fetchUsers();
    fetchAnnouncements();
  }, [currentUser, fetchDesas, fetchUsers, fetchAnnouncements]);

  useEffect(() => {
    if (!currentUser || desas.length === 0) return;
    fetchKelompok();
  }, [currentUser, desas, fetchKelompok]);

  useEffect(() => {
    if (!currentUser) return;

    if (GENERUS_SECTIONS.includes(activeSection)) fetchGenerus();
    if (GURUS_SECTIONS.includes(activeSection)) fetchGurus();
    if (KELAS_SECTIONS.includes(activeSection)) fetchKelas();
    if (ATTENDANCE_SECTIONS.includes(activeSection)) fetchAttendance();
    if (GRADES_SECTIONS.includes(activeSection)) fetchGrades();
    if (MATERIALS_SECTIONS.includes(activeSection)) fetchMaterials();
  }, [
    currentUser,
    activeSection,
    fetchGenerus,
    fetchGurus,
    fetchKelas,
    fetchAttendance,
    fetchGrades,
    fetchMaterials,
  ]);

  return {
    desas,
    kelompok,
    generus,
    users,
    materials,
    attendance,
    gurus,
    kelas,
    announcements,
    grades,
    loading,
    newGenerus,
    setNewGenerus,
    addGenerus,
    importGenerus,
    updateGenerus,
    deleteGenerus,
    addDesa,
    updateDesa,
    deleteDesa,
    addKelompok,
    updateKelompok,
    deleteKelompok,
    addUser,
    updateUser,
    resetUserPassword,
    deleteUser,
    addGuru,
    updateGuru,
    deleteGuru,
    addKelas,
    updateKelas,
    deleteKelas,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateCurrentUserPassword,
  };
}

export type AdminDashboardDataModel = ReturnType<typeof useAdminDashboardData>;
