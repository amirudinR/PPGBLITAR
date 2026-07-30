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
import { useLatihanASAD } from '@/hooks/useLatihanASAD';
import { useJariyahPPG } from '@/hooks/useJariyahPPG';
import { useChecklistTemplates, useChecklistAssignments } from '@/hooks/useChecklist';
import { useM5U } from '@/hooks/useM5U';
import { useEvaluasiPeriode, useEvaluasiSemester } from '@/hooks/useEvaluasi';
import { useEffect, useState, useRef } from 'react';
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
  'evaluasi-semester',
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
  'evaluasi-semester',
];

const ATTENDANCE_SECTIONS: AdminSectionId[] = ['dashboard', 'rekap-kelas', 'rekap-siswa', 'kehadiran-guru'];
const GRADES_SECTIONS: AdminSectionId[] = ['dashboard', 'input-nilai', 'rekap-nilai', 'rekap-per-kelas', 'detail-pencapaian-kelas'];
const MATERIALS_SECTIONS: AdminSectionId[] = ['dashboard', 'input-nilai', 'rekap-nilai', 'target-bulanan', 'rekap-per-kelas', 'detail-pencapaian-kelas'];
const LAPORAN_SECTIONS: AdminSectionId[] = ['latihan-asad', 'jariyah-ppg'];
const CHECKLIST_TEMPLATE_SECTIONS: AdminSectionId[] = ['checklist-template'];
const CHECKLIST_ASSIGNMENT_SECTIONS: AdminSectionId[] = ['checklist-saya', 'checklist-rekap'];
const M5U_SECTIONS: AdminSectionId[] = ['dashboard', 'm5u'];
const EVALUASI_PERIODE_SECTIONS: AdminSectionId[] = ['evaluasi-periode'];
const EVALUASI_SEMESTER_SECTIONS: AdminSectionId[] = ['evaluasi-semester', 'dashboard'];

export function useAdminDashboardData({ currentUser, activeSection }: UseAdminDashboardDataParams) {
  const { desas, loading: loadingDesa, fetchDesas, addDesa, updateDesa, deleteDesa } = useDesa();
  const { kelompok, loading: loadingKelompok, fetchKelompok, addKelompok, updateKelompok, deleteKelompok } = useKelompok(desas, currentUser);
  const { generus, loading: loadingGenerus, fetchGenerus, newGenerus, setNewGenerus, addGenerus, importGenerus, updateGenerus, deleteGenerus } = useGenerus(currentUser);
  const { users, loading: loadingUsers, fetchUsers, addUser, addUsersBatch, updateUser, resetUserPassword, deleteUser } = useUsers(currentUser);
  const { materials, loading: loadingMaterials, fetchMaterials } = useMaterials();
  const { attendance, loading: loadingAttendance, fetchAttendance } = useAttendance(currentUser);
  const { gurus, loading: loadingGurus, fetchGurus, addGuru, updateGuru, deleteGuru } = useGurus(currentUser, { onDataChange: fetchUsers });
  const { kelas, loading: loadingKelas, fetchKelas, addKelas, updateKelas, deleteKelas } = useKelas(currentUser);
  const { updateCurrentUserPassword } = useAuthManagement();
  const { announcements, loading: loadingAnnouncements, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(currentUser);
  const { grades, loading: loadingGrades, fetchGrades } = useGrades(currentUser);
  const { latihanItems, loading: loadingLatihan, fetchLatihan, addLatihan, updateLatihan, deleteLatihan } = useLatihanASAD(currentUser);
  const { jariyahItems, loading: loadingJariyah, fetchJariyah, addJariyah, updateJariyah, deleteJariyah } = useJariyahPPG(currentUser);
  const { templates, loading: loadingTemplates, fetchTemplates, addTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates(currentUser);
  const { assignments, loading: loadingAssignments, fetchAssignments, updateAssignment, createAssignment } = useChecklistAssignments(currentUser);
  const { m5uItems, loading: loadingM5U, hasPermission, fetchM5U, addM5U, updateM5U, deleteM5U, deleteMultipleM5U } = useM5U(currentUser);
  const { periodes, activePeriode, loading: loadingPeriode, fetchPeriodes, addPeriode, updatePeriode, deletePeriode } = useEvaluasiPeriode();
  const { evaluasiList, loading: loadingEvaluasi, fetchEvaluasi, saveEvaluasi, publishEvaluasi } = useEvaluasiSemester(currentUser);

  const [forceLoadingComplete, setForceLoadingComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rawLoading =
    loadingDesa ||
    loadingKelompok ||
    loadingGenerus ||
    loadingUsers ||
    loadingMaterials ||
    loadingAttendance ||
    loadingGurus ||
    loadingKelas ||
    loadingAnnouncements ||
    loadingGrades ||
    loadingLatihan ||
    loadingJariyah ||
    loadingTemplates ||
    loadingAssignments ||
    loadingM5U ||
    loadingPeriode ||
    loadingEvaluasi;

  const loading = rawLoading && !forceLoadingComplete;

  useEffect(() => {
    if (!currentUser) return;
    
    // Set timeout to force loading complete if Firestore is blocked
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("Forcing loading complete due to timeout (Firestore likely blocked)");
      setForceLoadingComplete(true);
    }, 8000); // 8 second timeout
    
    fetchDesas();
    fetchUsers();
    fetchAnnouncements();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
    if (LAPORAN_SECTIONS.includes(activeSection)) { fetchLatihan(); fetchJariyah(); }
    if (CHECKLIST_TEMPLATE_SECTIONS.includes(activeSection)) fetchTemplates();
    if (CHECKLIST_ASSIGNMENT_SECTIONS.includes(activeSection)) fetchAssignments();
    if (M5U_SECTIONS.includes(activeSection)) fetchM5U();
    if (EVALUASI_PERIODE_SECTIONS.includes(activeSection)) fetchPeriodes();
    if (EVALUASI_SEMESTER_SECTIONS.includes(activeSection)) fetchEvaluasi();
  }, [
    currentUser,
    activeSection,
    fetchGenerus,
    fetchGurus,
    fetchKelas,
    fetchAttendance,
    fetchGrades,
    fetchMaterials,
    fetchLatihan,
    fetchJariyah,
    fetchTemplates,
    fetchAssignments,
    fetchM5U,
    fetchPeriodes,
    fetchEvaluasi,
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
    latihanItems,
    jariyahItems,
    templates,
    assignments,
    m5uItems,
    periodes,
    activePeriode,
    evaluasiList,
    loading,
    loadingLatihan,
    loadingJariyah,
    loadingTemplates,
    loadingAssignments,
    loadingM5U,
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
    addUsersBatch,
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
    addLatihan,
    updateLatihan,
    deleteLatihan,
    addJariyah,
    updateJariyah,
    deleteJariyah,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    updateAssignment,
    createAssignment,
    hasPermission,
    fetchM5U,
    addM5U,
    updateM5U,
    deleteM5U,
    deleteMultipleM5U,
    addPeriode,
    updatePeriode,
    deletePeriode,
    saveEvaluasi,
    publishEvaluasi,
    updateCurrentUserPassword,
  };
}

export type AdminDashboardDataModel = ReturnType<typeof useAdminDashboardData>;
