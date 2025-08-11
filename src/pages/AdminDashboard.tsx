import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Material, User, Attendance, Generus } from '@/types/admin';
import Sidebar from '@/components/admin/Sidebar';
import AttendanceSection from '@/components/admin/AttendanceSection';
import MaterialsSection from '@/components/admin/MaterialsSection';
import AccountsSection from '@/components/admin/AccountsSection';
import GenerusSection from '@/components/admin/GenerusSection';

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
    { id: 1, title: 'Pengenalan React', description: 'Dasar-dasar React dan komponennya', date: '2024-01-15' },
    { id: 2, title: 'State Management', description: 'Menggunakan useState dan useEffect', date: '2024-01-16' },
  ]);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '' });

  // State for users
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Student', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Teacher', status: 'Active' },
  ]);

  // State for attendance
  const [attendance] = useState<Attendance[]>([
    { id: 1, studentName: 'John Doe', date: '2024-01-15', status: 'Hadir' },
    { id: 2, studentName: 'Jane Smith', date: '2024-01-15', status: 'Hadir' },
    { id: 3, studentName: 'John Doe', date: '2024-01-16', status: 'Izin' },
    { id: 4, studentName: 'Jane Smith', date: '2024-01-16', status: 'Tidak Hadir' },
  ]);

  // State for generus
  const [generus] = useState<Generus[]>([
    { id: 1, name: 'Adi Saputra', kelas: 'Praremaja', sekolah: 'SMPN 1', status: 'Aktif' },
    { id: 2, name: 'Budi Santoso', kelas: 'Remaja', sekolah: 'SMAN 2', status: 'Aktif' },
    { id: 3, name: 'Citra Lestari', kelas: 'Caberawit', sekolah: 'SDN 3', status: 'Aktif' },
    { id: 4, name: 'Dewi Anggraini', kelas: 'Praremaja', sekolah: 'SMPN 1', status: 'Non-aktif' },
  ]);

  const handleAddMaterial = () => {
    if (newMaterial.title && newMaterial.description) {
      setMaterials([...materials, {
        id: materials.length + 1,
        title: newMaterial.title,
        description: newMaterial.description,
        date: new Date().toISOString().split('T')[0]
      }]);
      setNewMaterial({ title: '', description: '' });
    }
  };

  const handleDeleteMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleLogout = () => {
    alert('Logging out...');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'generus':
        return <GenerusSection generus={generus} />;
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