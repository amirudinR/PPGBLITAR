import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Material, User, Attendance, Generus, KELAS_LIST } from '@/types/admin';
import Sidebar from '@/components/admin/Sidebar';
import AttendanceSection from '@/components/admin/AttendanceSection';
import MaterialsSection from '@/components/admin/MaterialsSection';
import AccountsSection from '@/components/admin/AccountsSection';
import GenerusSection from '@/components/admin/GenerusSection';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { showError } from '@/utils/toast';

const menuItems = [
    { id: 'generus', label: 'Data Generus' },
    { id: 'kehadiran', label: 'Kehadiran' },
    { id: 'materi', label: 'Materi' },
    { id: 'akun', label: 'Akun' },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('generus');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Student', status: 'Active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Teacher', status: 'Active' },
  ]);

  // State for attendance
  const [attendance] = useState<Attendance[]>([
    { id: '1', studentName: 'John Doe', date: '2024-01-15', status: 'Hadir' },
    { id: '2', studentName: 'Jane Smith', date: '2024-01-15', status: 'Hadir' },
    { id: '3', studentName: 'John Doe', date: '2024-01-16', status: 'Izin' },
    { id: '4', studentName: 'Jane Smith', date: '2024-01-16', status: 'Tidak Hadir' },
  ]);

  // State for generus
  const [generus, setGenerus] = useState<Generus[]>([]);
  const [loadingGenerus, setLoadingGenerus] = useState(true);

  useEffect(() => {
    const fetchGenerus = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "generus"));
        const generusData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Generus[];
        setGenerus(generusData);
      } catch (error) {
        console.error("Error fetching generus data: ", error);
        showError("Gagal memuat data generus.");
      } finally {
        setLoadingGenerus(false);
      }
    };

    if (activeSection === 'generus') {
        fetchGenerus();
    }
  }, [activeSection]);

  const handleAddMaterial = () => {
    if (newMaterial.rincianMateri && newMaterial.kelas && newMaterial.bulan) {
      const materialToAdd: Material = {
        id: (materials.length + 2).toString(),
        ...newMaterial
      };
      setMaterials([...materials, materialToAdd]);
      // Reset form
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

  const handleLogout = () => {
    alert('Logging out...');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'generus':
        return <GenerusSection generus={generus} loading={loadingGenerus} />;
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
            {menuItems.find(item => item.id === activeSection)?.label}
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