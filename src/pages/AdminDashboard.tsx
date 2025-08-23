import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { User } from '@/types/admin';
import Sidebar from '@/components/admin/Sidebar';
import AttendanceSection from '@/components/admin/AttendanceSection';
import MaterialsSection from '@/components/admin/MaterialsSection';
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
  { id: 'kehadiran', label: 'Kehadiran' },
  { id: 'kehadiran-guru', label: 'Kehadiran Generus' },
  { id: 'materi', label: 'Materi' },
  { id: 'm5u', label: 'M5U' },
];

export default function AdminDashboard({ currentUser, handleLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Generus section states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('name');
  
  // Dashboard section states
  const [dashboardFilterCategory, setDashboardFilterCategory] = useState('pendidikan');
  const [dashboardFilterValue, setDashboardFilterValue] = useState('Semua');
  const [jenjangUsiaFilter, setJenjangUsiaFilter] = useState<string[]>([]);

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
  const { kelompok, loading: loadingKelompok, fetchKelompok, addKelompok, updateKelompok, deleteKelompok } = useKelompok(desas);
  const { generus, loading: loadingGenerus, fetchGenerus, newGenerus, setNewGenerus, addGenerus, updateGenerus, deleteGenerus } = useGenerus(currentUser);
  const { users, loading: loadingUsers, fetchUsers, addUser, updateUser, deleteUser } = useUsers(currentUser);
  const { materials, loading: loadingMaterials, fetchMaterials, newMaterial, setNewMaterial, addMaterial, updateMaterial, deleteMaterial, deleteMultipleMaterials, addMultipleMaterials } = useMaterials();
  const { attendance, loading: loadingAttendance, fetchAttendance } = useAttendance(currentUser);
  const { gurus, loading: loadingGurus, fetchGurus, addGuru, updateGuru, deleteGuru } = useGurus(currentUser, { onDataChange: fetchUsers });
  const { kelas, loading: loadingKelas, fetchKelas, addKelas, updateKelas, deleteKelas } = useKelas(currentUser);
  const { updateCurrentUserPassword } = useAuthManagement();

  useEffect(() => {
    if (currentUser) {
      fetchDesas();
      fetchGenerus();
      fetchUsers();
      fetchMaterials();
      fetchAttendance();
      fetchGurus();
      fetchKelas();
    }
  }, [currentUser, fetchDesas, fetchGenerus, fetchUsers, fetchMaterials, fetchAttendance, fetchGurus, fetchKelas]);

  useEffect(() => {
    if (desas.length > 0) {
      fetchKelompok();
    }
  }, [desas, fetchKelompok]);

  const loading = loadingDesa || loadingKelompok || loadingGenerus || loadingUsers || loadingMaterials || loadingAttendance || loadingGurus || loadingKelas;

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

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection 
          stats={{ generus: generus.length, desa: desas.length, kelompok: kelompok.length, users: users.length }} 
          generusData={generus}
          dashboardFilterCategory={dashboardFilterCategory}
          setDashboardFilterCategory={setDashboardFilterCategory}
          dashboardFilterValue={dashboardFilterValue}
          setDashboardFilterValue={setDashboardFilterValue}
          jenjangUsiaFilter={jenjangUsiaFilter}
          setJenjangUsiaFilter={setJenjangUsiaFilter}
        />;
      case 'generus':
        return <GenerusSection 
          allGenerus={generus} 
          desas={desas}
          kelompok={kelompok}
          newGenerus={newGenerus} 
          setNewGenerus={setNewGenerus}
          onAddGenerus={addGenerus}
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
        />;
      case 'materi':
        return (
          <MaterialsSection
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
      case 'kehadiran':
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
      case 'kehadiran-guru':
        return <MonthlyAttendanceSection
          currentUser={currentUser}
          gurus={gurus}
          kelas={kelas}
          generus={generus}
        />;
      case 'm5u':
        return <M5USection />;
      case 'profile':
        return <ProfileSection currentUser={currentUser} onUpdatePassword={updateCurrentUserPassword} />;
      default:
        return <div className="text-center p-8">Pilih menu untuk memulai.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection} setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 overflow-auto">
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
          <div className="w-6" />
        </div>
        <main className="p-6">
          {loading ? <div className="text-center p-8">Memuat data...</div> : renderSection()}
        </main>
      </div>
    </div>
  );
}