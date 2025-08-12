import React, { useState, useEffect, useCallback } from 'react';
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { showError, showSuccess } from '@/utils/toast';

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
  
  // States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [generus, setGenerus] = useState<Generus[]>([
    { id: '1', name: 'Adi Saputra', jenisKelamin: 'Laki-laki', tahunLahir: 2007, pendidikan: 'SMP 3', statusMondok: 'Boarding school di Samarinda', namaAyah: 'Bambang', statusAyah: 'jm', namaIbu: 'Sumarni', statusIbu: 'hum', desa: 'Desa Maju', kelompok: 'Pra Remaja' },
    { id: '2', name: 'Budi Santoso', jenisKelamin: 'Laki-laki', tahunLahir: 2014, pendidikan: 'SD 4', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Joko', statusAyah: 'jm', namaIbu: 'Siti', statusIbu: 'jm', desa: 'Desa Jaya', kelompok: 'Caberawit' },
    { id: '3', name: 'Citra Lestari', jenisKelamin: 'Perempuan', tahunLahir: 2018, pendidikan: 'Paud/TK', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Agus', statusAyah: 'hum', namaIbu: 'Wati', statusIbu: 'hum', desa: 'Desa Makmur', kelompok: 'Caberawit' },
    { id: '4', name: 'Doni Firmansyah', jenisKelamin: 'Laki-laki', tahunLahir: 2004, pendidikan: 'Lulus Sekolah', statusMondok: 'Mubaligh/Mubalighot', namaAyah: 'Eko', statusAyah: 'jm', namaIbu: 'Yuni', statusIbu: 'hum', desa: 'Desa Sejahtera', kelompok: 'Pra Nikah' },
    { id: '5', name: 'Eka Putri', jenisKelamin: 'Perempuan', tahunLahir: 2002, pendidikan: 'MAHASISWA', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Hadi', statusAyah: 'hum', namaIbu: 'Rina', statusIbu: 'hum', desa: 'Desa Maju', kelompok: 'Pra Nikah' },
    { id: '6', name: 'Fajar Nugroho', jenisKelamin: 'Laki-laki', tahunLahir: 2006, pendidikan: 'SMA 1', statusMondok: 'Boarding school di luar Samarinda', namaAyah: 'Imam', statusAyah: 'jm', namaIbu: 'Dewi', statusIbu: 'jm', desa: 'Desa Jaya', kelompok: 'Remaja' },
    { id: '7', name: 'Gita Wulandari', jenisKelamin: 'Perempuan', tahunLahir: 2000, pendidikan: 'Lulus S1', statusMondok: 'Hadis Besar', namaAyah: 'Budi', statusAyah: 'hum', namaIbu: 'Lina', statusIbu: 'hum', desa: 'Desa Makmur', kelompok: 'Pra Nikah' },
    { id: '8', name: 'Hadi Prasetyo', jenisKelamin: 'Laki-laki', tahunLahir: 2016, pendidikan: 'SD 2', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Toni', statusAyah: 'jm', namaIbu: 'Maya', statusIbu: 'jm', desa: 'Desa Sejahtera', kelompok: 'Caberawit' },
    { id: '9', name: 'Indah Permata', jenisKelamin: 'Perempuan', tahunLahir: 2008, pendidikan: 'SMP 2', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Rudi', statusAyah: 'hum', namaIbu: 'Dina', statusIbu: 'hum', desa: 'Desa Maju', kelompok: 'Pra Remaja' },
    { id: '10', name: 'Joko Susilo', jenisKelamin: 'Laki-laki', tahunLahir: 2005, pendidikan: 'SMA 3', statusMondok: 'Tidak Sedang Mondok', namaAyah: 'Herman', statusAyah: 'jm', namaIbu: 'Sari', statusIbu: 'jm', desa: 'Desa Jaya', kelompok: 'Remaja' }
  ]);
  const [desas, setDesas] = useState<Desa[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);

  // New data states
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    jenisMateri: 'Materi bacaan', rincianMateri: '', kelas: KELAS_LIST[0], semester: 'Ganjil', bulan: ''
  });
  const [newGenerus, setNewGenerus] = useState<Omit<Generus, 'id'>>({
    name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, pendidikan: PENDIDIKAN_LIST[0],
    statusMondok: STATUS_MONDOK_LIST[3], namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
    desa: '', kelompok: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [desasSnap, kelompokSnap] = await Promise.all([
        getDocs(collection(db, "desa")),
        getDocs(collection(db, "kelompok")),
      ]);

      const desasData = desasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Desa[];
      setDesas(desasData);

      const kelompokData = kelompokSnap.docs.map(doc => {
        const data = doc.data();
        const desa = desasData.find(d => d.id === data.desaId);
        return { id: doc.id, ...data, desaName: desa?.name || 'N/A' } as Kelompok;
      });
      setKelompok(kelompokData);

    } catch (error) {
      console.error("Error fetching data: ", error);
      showError("Gagal memuat data dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD Handlers
  const handleAddDesa = async (name: string) => {
    if (!name.trim()) { showError("Nama desa tidak boleh kosong."); return false; }
    try {
      await addDoc(collection(db, "desa"), { name: name.trim() });
      fetchData();
      return true;
    } catch (e) { showError("Gagal menambahkan desa."); return false; }
  };

  const handleUpdateDesa = async (id: string, newName: string) => {
    if (!newName.trim()) { showError("Nama desa tidak boleh kosong."); return false; }
    try {
      await updateDoc(doc(db, "desa", id), { name: newName.trim() });
      fetchData();
      return true;
    } catch (e) { showError("Gagal memperbarui desa."); return false; }
  };

  const handleDeleteDesa = async (id: string) => {
    try {
      await deleteDoc(doc(db, "desa", id));
      fetchData();
      showSuccess("Desa berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus desa."); }
  };

  const handleAddKelompok = async (name: string, desaId: string) => {
    if (!name.trim() || !desaId) { showError("Nama kelompok dan desa harus diisi."); return false; }
    try {
      await addDoc(collection(db, "kelompok"), { name: name.trim(), desaId });
      fetchData();
      return true;
    } catch (e) { showError("Gagal menambahkan kelompok."); return false; }
  };

  const handleUpdateKelompok = async (id: string, newName: string, newDesaId: string) => {
    if (!newName.trim() || !newDesaId) { showError("Nama kelompok dan desa harus diisi."); return false; }
    try {
      await updateDoc(doc(db, "kelompok", id), { name: newName.trim(), desaId: newDesaId });
      fetchData();
      return true;
    } catch (e) { showError("Gagal memperbarui kelompok."); return false; }
  };

  const handleDeleteKelompok = async (id: string) => {
    try {
      await deleteDoc(doc(db, "kelompok", id));
      fetchData();
      showSuccess("Kelompok berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus kelompok."); }
  };
  
  const handleAddGenerus = async () => {
    if (!newGenerus.name) { showError("Nama harus diisi."); return false; }
    try {
      await addDoc(collection(db, "generus"), newGenerus);
      fetchData();
      setNewGenerus({
        name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, pendidikan: PENDIDIKAN_LIST[0],
        statusMondok: STATUS_MONDOK_LIST[3], namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
        desa: '', kelompok: ''
      });
      return true;
    } catch (e) { showError("Gagal menambahkan generus."); return false; }
  };

  const handleLogout = () => alert('Logging out...');

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
      case 'generus':
        return <GenerusSection 
          allGenerus={generus} newGenerus={newGenerus} setNewGenerus={setNewGenerus}
          onAddGenerus={handleAddGenerus} searchTerm={searchTerm} onSearchChange={setSearchTerm}
          filterCategory={filterCategory} onFilterCategoryChange={setFilterCategory}
        />;
      case 'desa':
        return <DesaSection 
          desas={desas} onAddDesa={handleAddDesa} onUpdateDesa={handleUpdateDesa}
          onDeleteDesa={handleDeleteDesa}
        />;
      case 'kelompok':
        return <KelompokSection 
          kelompok={kelompok} desas={desas} onAddKelompok={handleAddKelompok}
          onUpdateKelompok={handleUpdateKelompok} onDeleteKelompok={handleDeleteKelompok}
        />;
      // Other sections can be added here
      default:
        return <div className="text-center p-8">Pilih menu untuk memulai.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection} setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}
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