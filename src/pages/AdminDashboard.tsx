import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Material, User, Attendance, Generus, KELAS_LIST, PENDIDIKAN_LIST, STATUS_MONDOK_LIST, Desa, Kelompok } from '@/types/admin';
import Sidebar from '@/components/admin/Sidebar';
import AttendanceSection from '@/components/admin/AttendanceSection';
import MaterialsSection from '@/components/admin/MaterialsSection';
import AccountsSection from '@/components/admin/AccountsSection';
import GenerusSection from '@/components/admin/GenerusSection';
import DesaSection from '@/components/admin/DesaSection';
import KelompokSection from '@/components/admin/KelompokSection';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { showError } from '@/utils/toast';

const menuItems = [
  { 
    id: 'master', 
    label: 'Data Master', 
    children: [
      { id: 'akun', label: 'Akun' },
      { id: 'desa', label: 'Desa' },
      { id: 'kelompok', label: 'Kelompok' },
    ]
  },
  { id: 'generus', label: 'Data Generus' },
  { id: 'kehadiran', label: 'Kehadiran' },
  { id: 'materi', label: 'Materi' },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('generus');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('name');
  
  // State for materials
  const [materials, setMaterials] = useState<Material[]>([
    { 
      id: '1', 
      jenisMateri: 'Materi bacaan',
      rincianMateri: 'Al-Quran Juz 1, halaman 5-6',
      kelas: 'SD 1',
      semester: 'Ganjil',
      bulan: 'Juli'
    },
    { 
      id: '2', 
      jenisMateri: 'Hafalan',
      rincianMateri: 'Doa sebelum dan sesudah makan',
      kelas: 'Paud/TK',
      semester: 'Ganjil',
      bulan: 'Juli'
    },
    { 
      id: '3', 
      jenisMateri: 'Tatakrama',
      rincianMateri: 'Adab berbicara dengan orang tua dan guru',
      kelas: 'SD 6',
      semester: 'Genap',
      bulan: 'Februari'
    },
  ]);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    jenisMateri: 'Materi bacaan',
    rincianMateri: '',
    kelas: KELAS_LIST[0],
    semester: 'Ganjil',
    bulan: ''
  });

  // State for users
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Super Admin', email: 'super@admin.com', role: 'adminsuper', status: 'Active' },
    { id: '2', name: 'Admin Daerah', email: 'admin@daerah.com', role: 'admin', status: 'Active' },
    { id: '3', name: 'Kepala Desa', email: 'kades@desa.com', role: 'desa', status: 'Active' },
    { id: '4', name: 'Ketua Kelompok', email: 'kakel@kelompok.com', role: 'kelompok', status: 'Active' },
    { id: '5', name: 'Guru Ngaji', email: 'guru@ngaji.com', role: 'guru', status: 'Active' },
    { id: '6', name: 'Orang Tua Murid', email: 'ortu@murid.com', role: 'orangtua', status: 'Active' },
  ]);

  // State for attendance
  const [attendance] = useState<Attendance[]>([
    { id: '1', studentName: 'John Doe', date: '2024-01-15', status: 'Hadir' },
    { id: '2', studentName: 'Jane Smith', date: '2024-01-15', status: 'Hadir' },
    { id: '3', studentName: 'John Doe', date: '2024-01-16', status: 'Izin' },
    { id: '4', studentName: 'Jane Smith', date: '2024-01-16', status: 'Tidak Hadir' },
  ]);

  // State for generus
  const [generus, setGenerus] = useState<Generus[]>([
    { id: '1', name: 'Adi Saputra', jenisKelamin: 'Laki-laki', tahunLahir: 2005, pendidikan: 'SMA 2', statusMondok: 'Boarding school di Samarinda', namaAyah: 'Ayah Adi', statusAyah: 'jm', namaIbu: 'Ibu Adi', statusIbu: 'hum', desa: 'Desa Maju', kelompok: 'Remaja 1' },
    { id: '2', name: 'Budi Santoso', jenisKelamin: 'Laki-laki', tahunLahir: 2012, pendidikan: 'SD 6', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Ayah Budi', statusAyah: 'jm', namaIbu: 'Ibu Budi', statusIbu: 'jm', desa: 'Desa Jaya', kelompok: 'Caberawit' },
    { id: '3', name: 'Citra Lestari', jenisKelamin: 'Perempuan', tahunLahir: 2018, pendidikan: 'Paud/TK', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Ayah Citra', statusAyah: 'hum', namaIbu: 'Ibu Citra', statusIbu: 'hum', desa: 'Desa Makmur', kelompok: 'Caberawit' },
    { id: '4', name: 'Doni Firmansyah', jenisKelamin: 'Laki-laki', tahunLahir: 2004, pendidikan: 'Lulus Sekolah', statusMondok: 'Mubaligh/Mubalighot', namaAyah: 'Ayah Doni', statusAyah: 'jm', namaIbu: 'Ibu Doni', statusIbu: 'hum', desa: 'Desa Sejahtera', kelompok: 'Pra Nikah' },
  ]);
  const [newGenerus, setNewGenerus] = useState<Omit<Generus, 'id'>>({
    name: '',
    jenisKelamin: 'Laki-laki',
    tahunLahir: 2010,
    pendidikan: PENDIDIKAN_LIST[0],
    statusMondok: STATUS_MONDOK_LIST[3],
    namaAyah: '',
    statusAyah: '',
    namaIbu: '',
    statusIbu: '',
    desa: '',
    kelompok: ''
  });

  // State for Data Master
  const [desas, setDesas] = useState<Desa[]>([
    { id: '1', name: 'Desa Maju' },
    { id: '2', name: 'Desa Jaya' },
    { id: '3', name: 'Desa Makmur' },
  ]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([
    { id: '1', name: 'Remaja 1', desaId: '1', desaName: 'Desa Maju' },
    { id: '2', name: 'Caberawit', desaId: '2', desaName: 'Desa Jaya' },
    { id: '3', name: 'Pra Nikah', desaId: '1', desaName: 'Desa Maju' },
  ]);

  const handleAddGenerus = () => {
    if (!newGenerus.name || !newGenerus.desa || !newGenerus.kelompok) {
        showError("Nama, Desa, dan Kelompok harus diisi.");
        return false;
    }
    const generusToAdd: Generus = {
        id: `gen-${Date.now()}`,
        ...newGenerus
    };
    setGenerus(prev => [...prev, generusToAdd]);
    setNewGenerus({
        name: '',
        jenisKelamin: 'Laki-laki',
        tahunLahir: 2010,
        pendidikan: PENDIDIKAN_LIST[0],
        statusMondok: STATUS_MONDOK_LIST[3],
        namaAyah: '',
        statusAyah: '',
        namaIbu: '',
        statusIbu: '',
        desa: '',
        kelompok: ''
    });
    return true;
  };

  const handleAddMaterial = () => {
    if (newMaterial.rincianMateri && newMaterial.kelas && newMaterial.bulan) {
      const materialToAdd: Material = {
        id: (materials.length + 2).toString(),
        ...newMaterial
      };
      setMaterials([...materials, materialToAdd]);
      setNewMaterial({
        jenisMateri: 'Materi bacaan',
        rincianMateri: '',
        kelas: KELAS_LIST[0],
        semester: 'Ganjil',
        bulan: ''
      });
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleAddDesa = (name: string) => {
    if (!name.trim()) {
      showError("Nama desa tidak boleh kosong.");
      return false;
    }
    const newDesa: Desa = {
      id: `desa-${Date.now()}`,
      name: name.trim(),
    };
    setDesas(prev => [...prev, newDesa]);
    return true;
  };

  const handleUpdateDesa = (id: string, newName: string) => {
    if (!newName.trim()) {
      showError("Nama desa tidak boleh kosong.");
      return false;
    }
    setDesas(prev => prev.map(d => d.id === id ? { ...d, name: newName.trim() } : d));
    return true;
  };

  const handleDeleteDesa = (id: string) => {
    setDesas(prev => prev.filter(d => d.id !== id));
  };

  const handleAddKelompok = (name: string, desaId: string) => {
    if (!name.trim() || !desaId) {
      showError("Nama kelompok dan desa harus diisi.");
      return false;
    }
    const desa = desas.find(d => d.id === desaId);
    if (!desa) return false;

    const newKelompok: Kelompok = {
      id: `kelompok-${Date.now()}`,
      name: name.trim(),
      desaId,
      desaName: desa.name,
    };
    setKelompok(prev => [...prev, newKelompok]);
    return true;
  };

  const handleUpdateKelompok = (id: string, newName: string, newDesaId: string) => {
    if (!newName.trim() || !newDesaId) {
      showError("Nama kelompok dan desa harus diisi.");
      return false;
    }
    const desa = desas.find(d => d.id === newDesaId);
    if (!desa) return false;

    setKelompok(prev => prev.map(k => k.id === id ? { ...k, name: newName.trim(), desaId: newDesaId, desaName: desa.name } : k));
    return true;
  };

  const handleDeleteKelompok = (id: string) => {
    setKelompok(prev => prev.filter(k => k.id !== id));
  };

  const handleLogout = () => {
    alert('Logging out...');
  };

  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.id === activeSection) {
        return item.label;
      }
      if (item.children) {
        const child = item.children.find(c => c.id === activeSection);
        if (child) {
          return child.label;
        }
      }
    }
    return 'Dashboard';
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'generus':
        return <GenerusSection 
          allGenerus={generus}
          newGenerus={newGenerus}
          setNewGenerus={setNewGenerus}
          onAddGenerus={handleAddGenerus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
        />;
      case 'kehadiran':
        return <AttendanceSection attendance={attendance} />;
      case 'materi':
        return (
          <MaterialsSection
            materials={materials}
            newMaterial={newMaterial}
            setNewMaterial={setNewMaterial}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        );
      case 'akun':
        return <AccountsSection users={users} onDeleteUser={handleDeleteUser} />;
      case 'desa':
        return <DesaSection 
          desas={desas} 
          onAddDesa={handleAddDesa}
          onUpdateDesa={handleUpdateDesa}
          onDeleteDesa={handleDeleteDesa}
        />;
      case 'kelompok':
        return <KelompokSection 
          kelompok={kelompok} 
          desas={desas}
          onAddKelompok={handleAddKelompok}
          onUpdateKelompok={handleUpdateKelompok}
          onDeleteKelompok={handleDeleteKelompok}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto">
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">
            {getPageTitle()}
          </h2>
          <div className="w-6" />
        </div>

        <main className="p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}