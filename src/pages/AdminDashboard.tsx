import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/admin';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import AttendanceSection from '@/components/admin/AttendanceSection';
import MaterialsSections from '@/components/admin/MaterialsSection';
import AccountsSection from '@/components/admin/AccountsSection';
import GenerusSection from '@/components/admin/GenerusSection';
import DesaSection from '@/components/admin/DesaSection';
import KelompokSection from '@/components/admin/KelompokSection';
import DashboardSection from '@/components/admin/DashboardSection';
import M5USection from '@/components/admin/M5USection';
import GuruSection from '@/components/admin/GuruSection';
import KelasSection from '@/components/admin/KelasSection';
import ProfileSection from '@/components/admin/ProfileSection';
import MonthlyAttendanceSection from '@/components/admin/MonthlyAttendanceSection';
import StudentAttendanceRecapSection from '@/components/admin/StudentAttendanceRecapSection';
import NilaiGenerusSection from '@/components/admin/NilaiGenerusSection';
import RekapNilaiSection from '@/components/admin/RekapNilaiSection';
import AnnouncementsSection from '@/components/admin/AnnouncementsSection';
import GuruDashboardStats from '@/components/admin/GuruDashboardStats';
import M5USearchPage from '@/pages/M5USearchPage';
import TargetBulananSection from '@/components/admin/TargetBulananSection';
import RekapPerKelasSection from '@/components/admin/RekapPerKelasSection';
import DetailPencapaianKelas from '@/components/admin/DetailPencapaianKelas';
import LatihanASADSection from '@/components/admin/LatihanASADSection';
import JariyahPPGSection from '@/components/admin/JariyahPPGSection';

// Import custom hooks
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
import { useTheme } from '@/hooks/useTheme';

interface AdminDashboardProps {
  currentUser: User | null;
  handleLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'profile', label: 'Profil Saya' },
  {
    id: 'master',
    label: 'Data Master',
    children: [
      { id: 'akun', label: 'Akun' },
      { id: 'desa', label: 'Desa' },
      { id: 'kelompok', label: 'Kelompok' },
      { id: 'dataguru', label: 'Data Guru' },
      { id: 'datakelas', label: 'Data Kelas' },
    ]
  },
  { id: 'generus', label: 'Data Generus' },
  {
    id: 'kehadiran',
    label: 'Kehadiran',
    children: [
      { id: 'kehadiran-guru', label: 'Input Kehadiran' },
      { id: 'rekap-kelas', label: 'Rekap Per Kelas' },
      { id: 'rekap-siswa', label: 'Rekap Per Siswa' },
    ]
  },
  {
    id: 'nilai',
    label: 'Nilai Generus',
    children: [
      { id: 'input-nilai', label: 'Input Nilai' },
      { id: 'rekap-nilai', label: 'Rekap Nilai' },
    ]
  },
  {
    id: 'target-materi',
    label: 'Target Materi',
    children: [
      { id: 'target-bulanan', label: 'Target Bulanan' },
      { id: 'rekap-per-kelas', label: 'Rekap Per Kelas' },
    ]
  },
  {
    id: 'laporan',
    label: 'Laporan',
    children: [
      { id: 'm5u', label: 'M5U' },
      { id: 'cari-hasil-m5u', label: 'Cari Hasil M5U' },
      { id: 'latihan-asad', label: 'Latihan ASAD' },
      { id: 'jariyah-ppg', label: 'Jariyah PPG' },
    ]
  },
  { id: 'pengumuman', label: 'Pengumuman' },
];

export default function AdminDashboard({ currentUser, handleLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailKelasId, setDetailKelasId] = useState<string | null>(null);
  const [periode, setPeriode] = useState({
    startMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    startYear: new Date().getFullYear().toString(),
    endMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    endYear: new Date().getFullYear().toString()
  });
  const navigate = useNavigate();

  // Generus section states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('name');

  // Attendance section states
  const [startMonth, setStartMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endMonth, setEndMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  // Materials section states
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [materialFilterCategory, setMaterialFilterCategory] = useState('judulMateri');
  const [materialMonthFilter, setMaterialMonthFilter] = useState<string[]>([]);

  // Using custom hooks for data management
  const { desas, loading: loadingDesa, fetchDesas, addDesa, updateDesa, deleteDesa } = useDesa();
  const { kelompok, loading: loadingKelompok, fetchKelompok, addKelompok, updateKelompok, deleteKelompok } = useKelompok(desas, currentUser);
  const { generus, loading: loadingGenerus, fetchGenerus, newGenerus, setNewGenerus, addGenerus, importGenerus, updateGenerus, deleteGenerus, populateGenerus } = useGenerus(currentUser);
  const { users, loading: loadingUsers, fetchUsers, addUser, updateUser, deleteUser } = useUsers(currentUser);
  const { materials, loading: loadingMaterials, fetchMaterials, newMaterial, setNewMaterial, addMaterial, updateMaterial, deleteMaterial, deleteMultipleMaterials, addMultipleMaterials } = useMaterials();
  const { attendance, loading: loadingAttendance, fetchAttendance } = useAttendance(currentUser);
  const { gurus, loading: loadingGurus, fetchGurus, addGuru, updateGuru, deleteGuru } = useGurus(currentUser, { onDataChange: fetchUsers });
  const { kelas, loading: loadingKelas, fetchKelas, addKelas, updateKelas, deleteKelas } = useKelas(currentUser);
  const { updateCurrentUserPassword } = useAuthManagement();
  const { announcements, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(currentUser);
  const { grades, fetchGrades } = useGrades(currentUser);

  // Calculate overall loading state
  const loading = loadingDesa || loadingKelompok || loadingGenerus || loadingUsers || loadingMaterials || loadingAttendance || loadingGurus || loadingKelas;

  useEffect(() => {
    if (currentUser) {
      fetchDesas();
      fetchGenerus();
      fetchUsers();
      fetchMaterials();
      fetchAttendance();
      fetchGurus();
      fetchKelas();
      fetchGrades();
      fetchAnnouncements();
    }
  }, [currentUser, fetchDesas, fetchGenerus, fetchUsers, fetchMaterials, fetchAttendance, fetchGurus, fetchKelas, fetchGrades, fetchAnnouncements]);

  useEffect(() => {
    if (desas.length > 0) {
      fetchKelompok();
    }
  }, [desas, fetchKelompok]);

  const handleImportGenerus = async (data: Omit<any, 'id'>[]) => {
    // Menggunakan fungsi importGenerus dari hook
    const success = await importGenerus(data);
    return success;
  };

  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.id === activeSection) return item.label;
      if (item.children) {
        const child = item.children.find(c => c.id === activeSection);
        if (child) return child.label;
      }
    }
    return 'Dashboard';
  };

  const handleViewDetail = (kelasId: string) => {
    setDetailKelasId(kelasId);
    setActiveSection('detail-pencapaian-kelas');
  };

  const handleBackFromDetail = () => {
    setDetailKelasId(null);
    setActiveSection('rekap-per-kelas');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        // Special handling for guru dashboard
        if (currentUser?.role === 'guru') {
          return (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Assalamualaikum, {currentUser.name}</h2>
                <p className="text-muted-foreground">Selamat datang di dasbor Anda sebagai Guru.</p>
              </div>
              <GuruDashboardStats
                kelas={kelas}
                generusData={generus}
                attendance={attendance}
                materials={materials}
                grades={grades}
              />
            </div>
          );
        }
        // Default dashboard for other roles
        return <DashboardSection
          stats={{ generus: generus.length, desa: desas.length, kelompok: kelompok.length, users: users.length, gurus: gurus.length, kelas: kelas.length }}
          generusData={generus}
          currentUser={currentUser}
          attendance={attendance}
          kelas={kelas}
          materials={materials}
          grades={grades}
          announcements={announcements}
        />;
      case 'generus':
        return <GenerusSection
          allGenerus={generus}
          desas={desas}
          kelompok={kelompok}
          newGenerus={newGenerus}
          setNewGenerus={setNewGenerus}
          onAddGenerus={addGenerus}
          onImportGenerus={handleImportGenerus}
          onUpdateGenerus={updateGenerus}
          onDeleteGenerus={deleteGenerus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          currentUser={currentUser}
        />;
      case 'desa':
        return <DesaSection
          desas={desas} onAddDesa={addDesa} onUpdateDesa={updateDesa}
          onDeleteDesa={deleteDesa}
        />;
      case 'kelompok':
        return <KelompokSection
          kelompok={kelompok} desas={desas} onAddKelompok={addKelompok}
          onUpdateKelompok={updateKelompok} onDeleteKelompok={deleteKelompok}
        />;
      case 'akun':
        return <AccountsSection
          users={users}
          desas={desas}
          kelompok={kelompok}
          onAddUser={addUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          currentUser={currentUser}
        />;
      case 'dataguru':
        return <GuruSection
          gurus={gurus}
          onAddGuru={addGuru}
          onUpdateGuru={updateGuru}
          onDeleteGuru={deleteGuru}
          currentUser={currentUser}
          desas={desas}
          kelompok={kelompok}
        />;
      case 'datakelas':
        return <KelasSection
          kelas={kelas}
          gurus={gurus}
          generus={generus}
          onAddKelas={addKelas}
          onUpdateKelas={updateKelas}
          onDeleteKelas={deleteKelas}
          currentUser={currentUser}
          desas={desas}
          kelompok={kelompok}
        />;
      case 'pencapaian-target-materi':
        return (
          <MaterialsSections
            materials={materials}
            newMaterial={newMaterial}
            setNewMaterial={setNewMaterial}
            onAddMaterial={addMaterial}
            onUpdateMaterial={updateMaterial}
            onDeleteMaterial={deleteMaterial}
            onDeleteMultipleMaterials={deleteMultipleMaterials}
            onAddMultipleMaterials={addMultipleMaterials}
            currentUser={currentUser}
            searchTerm={materialSearchTerm}
            setSearchTerm={setMaterialSearchTerm}
            filterCategory={materialFilterCategory}
            setFilterCategory={setMaterialFilterCategory}
            monthFilter={materialMonthFilter}
            setMonthFilter={setMaterialMonthFilter}
          />
        );
      case 'rekap-kelas':
        return <AttendanceSection
          attendance={attendance}
          desas={desas}
          generusData={generus}
          kelas={kelas}
          startMonth={startMonth}
          setStartMonth={setStartMonth}
          startYear={startYear}
          setStartYear={setStartYear}
          endMonth={endMonth}
          setEndMonth={setEndMonth}
          endYear={endYear}
          setEndYear={setEndYear}
          currentUser={currentUser}
        />;
      case 'rekap-siswa':
        return <StudentAttendanceRecapSection
          attendance={attendance}
          desas={desas}
          kelompok={kelompok}
          kelas={kelas}
          currentUser={currentUser}
          startMonth={startMonth}
          setStartMonth={setStartMonth}
          startYear={startYear}
          setStartYear={setStartYear}
          endMonth={endMonth}
          setEndMonth={setEndMonth}
          endYear={endYear}
          setEndYear={setEndYear}
        />;
      case 'kehadiran-guru':
        return <MonthlyAttendanceSection
          currentUser={currentUser}
          gurus={gurus}
          kelas={kelas}
          generus={generus}
        />;
      case 'input-nilai':
        return <NilaiGenerusSection
          currentUser={currentUser}
          kelas={kelas}
          generus={generus}
          materials={materials}
        />;
      case 'rekap-nilai':
        return <RekapNilaiSection
          currentUser={currentUser}
          kelas={kelas}
          generus={generus}
          materials={materials}
          startMonth={startMonth}
          setStartMonth={setStartMonth}
          startYear={startYear}
          setStartYear={setStartYear}
          endMonth={endMonth}
          setEndMonth={setEndMonth}
          endYear={endYear}
          setEndYear={setEndYear}
        />;
      case 'pengumuman':
        return <AnnouncementsSection
          announcements={announcements}
          onAdd={addAnnouncement}
          onUpdate={updateAnnouncement}
          onDelete={deleteAnnouncement}
        />;
      case 'm5u':
        return <M5USection currentUser={currentUser} />;
      case 'cari-hasil-m5u':
        return <M5USearchPage currentUser={currentUser} />;
      case 'latihan-asad':
        return <LatihanASADSection currentUser={currentUser} generus={generus} />;
      case 'jariyah-ppg':
        return <JariyahPPGSection currentUser={currentUser} generus={generus} />;
      case 'profile':
        return <ProfileSection currentUser={currentUser} onUpdatePassword={updateCurrentUserPassword} />;
      case 'target-bulanan':
        return <TargetBulananSection
          kelas={kelas}
          materials={materials}
          currentUser={currentUser}
        />;
      case 'rekap-per-kelas':
        return <RekapPerKelasSection
          kelas={kelas}
          materials={materials}
          grades={grades}
          currentUser={currentUser}
          onViewDetail={handleViewDetail}
        />;
      case 'detail-pencapaian-kelas':
        const selectedKelas = kelas.find(k => k.id === detailKelasId);
        return <DetailPencapaianKelas
          kelas={selectedKelas}
          generus={generus}
          materials={materials}
          grades={grades}
          onBack={handleBackFromDetail}
          startDate={{ month: periode.startMonth, year: periode.startYear }}
          endDate={{ month: periode.endMonth, year: periode.endYear }}
        />;
      default:
        return <div className="text-center p-8">Pilih menu untuk memulai.</div>;
    }
  };
  // Theme hook
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-auto p-6">
          {loading ? <div className="text-center p-8">Memuat data...</div> : renderSection()}
        </main>
      </div>
    </div>
  );
}