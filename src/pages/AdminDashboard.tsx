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
import DashboardSection from '@/components/admin/DashboardSection';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
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

const generusSeedData: Omit<Generus, 'id'>[] = [
    {"name":"Adi Saputra","jenisKelamin":"Laki-laki","tahunLahir":2007,"pendidikan":"SMP 3","statusMondok":"Boarding school di Samarinda","namaAyah":"Bambang","statusAyah":"jm","namaIbu":"Sumarni","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Remaja"},
    {"name":"Budi Santoso","jenisKelamin":"Laki-laki","tahunLahir":2014,"pendidikan":"SD 4","statusMondok":"Tidak Sedang Mondok","namaAyah":"Joko","statusAyah":"jm","namaIbu":"Siti","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Caberawit"},
    {"name":"Citra Lestari","jenisKelamin":"Perempuan","tahunLahir":2018,"pendidikan":"Paud/TK","statusMondok":"Tidak Sedang Mondok","namaAyah":"Agus","statusAyah":"hum","namaIbu":"Wati","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Caberawit"},
    {"name":"Doni Firmansyah","jenisKelamin":"Laki-laki","tahunLahir":2004,"pendidikan":"Lulus Sekolah","statusMondok":"Mubaligh/Mubalighot","namaAyah":"Eko","statusAyah":"jm","namaIbu":"Yuni","statusIbu":"hum","desa":"Desa Sejahtera","kelompok":"Pra Nikah"},
    {"name":"Eka Putri","jenisKelamin":"Perempuan","tahunLahir":2002,"pendidikan":"MAHASISWA","statusMondok":"Tidak Sedang Mondok","namaAyah":"Hadi","statusAyah":"hum","namaIbu":"Rina","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Nikah"},
    {"name":"Fajar Nugroho","jenisKelamin":"Laki-laki","tahunLahir":2006,"pendidikan":"SMA 1","statusMondok":"Boarding school di luar Samarinda","namaAyah":"Imam","statusAyah":"jm","namaIbu":"Dewi","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Remaja"},
    {"name":"Gita Wulandari","jenisKelamin":"Perempuan","tahunLahir":2000,"pendidikan":"Lulus S1","statusMondok":"Hadis Besar","namaAyah":"Budi","statusAyah":"hum","namaIbu":"Lina","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Pra Nikah"},
    {"name":"Hadi Prasetyo","jenisKelamin":"Laki-laki","tahunLahir":2016,"pendidikan":"SD 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Toni","statusAyah":"jm","namaIbu":"Maya","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Caberawit"},
    {"name":"Indah Permata","jenisKelamin":"Perempuan","tahunLahir":2008,"pendidikan":"SMP 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Rudi","statusAyah":"hum","namaIbu":"Dina","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Remaja"},
    {"name":"Joko Susilo","jenisKelamin":"Laki-laki","tahunLahir":2005,"pendidikan":"SMA 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Herman","statusAyah":"jm","namaIbu":"Sari","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Remaja"},
    {"name":"Kartika Sari","jenisKelamin":"Perempuan","tahunLahir":2015,"pendidikan":"SD 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Surya","statusAyah":"hum","namaIbu":"Nia","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Caberawit"},
    {"name":"Lutfi Hakim","jenisKelamin":"Laki-laki","tahunLahir":2009,"pendidikan":"SMP 1","statusMondok":"Boarding school di Samarinda","namaAyah":"Ahmad","statusAyah":"jm","namaIbu":"Fitri","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Pra Remaja"},
    {"name":"Mega Utami","jenisKelamin":"Perempuan","tahunLahir":2003,"pendidikan":"MAHASISWA","statusMondok":"Tidak Sedang Mondok","namaAyah":"Wahyu","statusAyah":"hum","namaIbu":"Lestari","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Nikah"},
    {"name":"Nanda Pratama","jenisKelamin":"Laki-laki","tahunLahir":2017,"pendidikan":"SD 1","statusMondok":"Tidak Sedang Mondok","namaAyah":"Dedi","statusAyah":"jm","namaIbu":"Indah","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Caberawit"},
    {"name":"Olivia Putri","jenisKelamin":"Perempuan","tahunLahir":2007,"pendidikan":"SMA 1","statusMondok":"Boarding school di luar Samarinda","namaAyah":"Bayu","statusAyah":"hum","namaIbu":"Putri","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Remaja"},
    {"name":"Putra Wijaya","jenisKelamin":"Laki-laki","tahunLahir":1999,"pendidikan":"Lulus S2","statusMondok":"Hadis Besar","namaAyah":"Candra","statusAyah":"jm","namaIbu":"Wulan","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Pra Nikah"},
    {"name":"Queen Aisyah","jenisKelamin":"Perempuan","tahunLahir":2019,"pendidikan":"Belum sekolah","statusMondok":"Tidak Sedang Mondok","namaAyah":"Rian","statusAyah":"hum","namaIbu":"Bella","statusIbu":"hum","desa":"Desa Maju","kelompok":"Caberawit"},
    {"name":"Rizky Maulana","jenisKelamin":"Laki-laki","tahunLahir":2013,"pendidikan":"SD 5","statusMondok":"Tidak Sedang Mondok","namaAyah":"Faisal","statusAyah":"jm","namaIbu":"Ratih","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Caberawit"},
    {"name":"Siti Aminah","jenisKelamin":"Perempuan","tahunLahir":2006,"pendidikan":"SMA 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Heru","statusAyah":"hum","namaIbu":"Anisa","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Remaja"},
    {"name":"Taufik Hidayat","jenisKelamin":"Laki-laki","tahunLahir":2010,"pendidikan":"SD 6","statusMondok":"Boarding school di Samarinda","namaAyah":"Irfan","statusAyah":"jm","namaIbu":"Farida","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Caberawit"},
    {"name":"Umar Abdullah","jenisKelamin":"Laki-laki","tahunLahir":2008,"pendidikan":"SMP 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Zainal","statusAyah":"jm","namaIbu":"Zahra","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Remaja"},
    {"name":"Vina Lestari","jenisKelamin":"Perempuan","tahunLahir":2001,"pendidikan":"Lulus S1","statusMondok":"Tidak Sedang Mondok","namaAyah":"Yusuf","statusAyah":"hum","namaIbu":"Yasmin","statusIbu":"hum","desa":"Desa Jaya","kelompok":"Pra Nikah"},
    {"name":"Wahyu Ramadhan","jenisKelamin":"Laki-laki","tahunLahir":2005,"pendidikan":"SMA 3","statusMondok":"Boarding school di luar Samarinda","namaAyah":"Tegar","statusAyah":"jm","namaIbu":"Tari","statusIbu":"jm","desa":"Desa Makmur","kelompok":"Remaja"},
    {"name":"Xavier Nugraha","jenisKelamin":"Laki-laki","tahunLahir":2012,"pendidikan":"SD 6","statusMondok":"Tidak Sedang Mondok","namaAyah":"Udin","statusAyah":"jm","namaIbu":"Uli","statusIbu":"hum","desa":"Desa Sejahtera","kelompok":"Caberawit"},
    {"name":"Yulia Anggraini","jenisKelamin":"Perempuan","tahunLahir":2003,"pendidikan":"MAHASISWA","statusMondok":"Tidak Sedang Mondok","namaAyah":"Vino","statusAyah":"hum","namaIbu":"Vira","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Nikah"},
    {"name":"Zidan Al-Ghifari","jenisKelamin":"Laki-laki","tahunLahir":2007,"pendidikan":"SMP 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Wawan","statusAyah":"jm","namaIbu":"Winda","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Remaja"},
    {"name":"Amanda Putri","jenisKelamin":"Perempuan","tahunLahir":2014,"pendidikan":"SD 4","statusMondok":"Tidak Sedang Mondok","namaAyah":"Xander","statusAyah":"hum","namaIbu":"Xena","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Caberawit"},
    {"name":"Bayu Segara","jenisKelamin":"Laki-laki","tahunLahir":2018,"pendidikan":"Paud/TK","statusMondok":"Tidak Sedang Mondok","namaAyah":"Yanto","statusAyah":"jm","namaIbu":"Yanti","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Caberawit"},
    {"name":"Cindy Claudia","jenisKelamin":"Perempuan","tahunLahir":2004,"pendidikan":"Lulus Sekolah","statusMondok":"Mubaligh/Mubalighot","namaAyah":"Zaki","statusAyah":"hum","namaIbu":"Zia","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Nikah"},
    {"name":"Dimas Anggara","jenisKelamin":"Laki-laki","tahunLahir":2002,"pendidikan":"MAHASISWA","statusMondok":"Tidak Sedang Mondok","namaAyah":"Arif","statusAyah":"jm","namaIbu":"Ari","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Nikah"},
    {"name":"Elisa Sari","jenisKelamin":"Perempuan","tahunLahir":2006,"pendidikan":"SMA 1","statusMondok":"Boarding school di Samarinda","namaAyah":"Bima","statusAyah":"hum","namaIbu":"Bunga","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Remaja"},
    {"name":"Farhan Jauhari","jenisKelamin":"Laki-laki","tahunLahir":2000,"pendidikan":"Lulus S1","statusMondok":"Hadis Besar","namaAyah":"Cipto","statusAyah":"jm","namaIbu":"Citra","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Pra Nikah"},
    {"name":"Grace Natalie","jenisKelamin":"Perempuan","tahunLahir":2016,"pendidikan":"SD 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Dodo","statusAyah":"hum","namaIbu":"Dedeh","statusIbu":"hum","desa":"Desa Maju","kelompok":"Caberawit"},
    {"name":"Hendra Gunawan","jenisKelamin":"Laki-laki","tahunLahir":2008,"pendidikan":"SMP 2","statusMondok":"Boarding school di luar Samarinda","namaAyah":"Endang","statusAyah":"jm","namaIbu":"Eni","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Remaja"},
    {"name":"Irene Agustin","jenisKelamin":"Perempuan","tahunLahir":2005,"pendidikan":"SMA 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Fadli","statusAyah":"hum","namaIbu":"Fifi","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Remaja"},
    {"name":"Kevin Sanjaya","jenisKelamin":"Laki-laki","tahunLahir":2015,"pendidikan":"SD 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Gilang","statusAyah":"jm","namaIbu":"Gita","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Caberawit"},
    {"name":"Laura Basuki","jenisKelamin":"Perempuan","tahunLahir":2009,"pendidikan":"SMP 1","statusMondok":"Tidak Sedang Mondok","namaAyah":"Hengky","statusAyah":"hum","namaIbu":"Hesti","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Remaja"},
    {"name":"Muhammad Zidan","jenisKelamin":"Laki-laki","tahunLahir":2003,"pendidikan":"MAHASISWA","statusMondok":"Boarding school di Samarinda","namaAyah":"Iwan","statusAyah":"jm","namaIbu":"Ika","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Nikah"},
    {"name":"Nadia Zerlinda","jenisKelamin":"Perempuan","tahunLahir":2017,"pendidikan":"SD 1","statusMondok":"Tidak Sedang Mondok","namaAyah":"Jamal","statusAyah":"hum","namaIbu":"Jeni","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Caberawit"},
    {"name":"Oscar Daniel","jenisKelamin":"Laki-laki","tahunLahir":2007,"pendidikan":"SMA 1","statusMondok":"Tidak Sedang Mondok","namaAyah":"Kiki","statusAyah":"jm","namaIbu":"Kania","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Remaja"},
    {"name":"Putri Marino","jenisKelamin":"Perempuan","tahunLahir":1999,"pendidikan":"Lulus S2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Lutfi","statusAyah":"hum","namaIbu":"Lala","statusIbu":"hum","desa":"Desa Maju","kelompok":"Pra Nikah"},
    {"name":"Randy Pangalila","jenisKelamin":"Laki-laki","tahunLahir":2019,"pendidikan":"Belum sekolah","statusMondok":"Tidak Sedang Mondok","namaAyah":"Maman","statusAyah":"jm","namaIbu":"Mimi","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Caberawit"},
    {"name":"Sandra Dewi","jenisKelamin":"Perempuan","tahunLahir":2013,"pendidikan":"SD 5","statusMondok":"Boarding school di luar Samarinda","namaAyah":"Nono","statusAyah":"hum","namaIbu":"Nani","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Caberawit"},
    {"name":"Teuku Rassya","jenisKelamin":"Laki-laki","tahunLahir":2006,"pendidikan":"SMA 2","statusMondok":"Tidak Sedang Mondok","namaAyah":"Oman","statusAyah":"jm","namaIbu":"Oki","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Remaja"},
    {"name":"Vanessa Angel","jenisKelamin":"Perempuan","tahunLahir":2010,"pendidikan":"SD 6","statusMondok":"Tidak Sedang Mondok","namaAyah":"Pandu","statusAyah":"hum","namaIbu":"Popi","statusIbu":"hum","desa":"Desa Maju","kelompok":"Caberawit"},
    {"name":"Willy Dozan","jenisKelamin":"Laki-laki","tahunLahir":2008,"pendidikan":"SMP 2","statusMondok":"Boarding school di Samarinda","namaAyah":"Qomar","statusAyah":"jm","namaIbu":"Qiqi","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Remaja"},
    {"name":"Yuki Kato","jenisKelamin":"Perempuan","tahunLahir":2001,"pendidikan":"Lulus S1","statusMondok":"Mubaligh/Mubalighot","namaAyah":"Rahmat","statusAyah":"hum","namaIbu":"Rara","statusIbu":"hum","desa":"Desa Makmur","kelompok":"Pra Nikah"},
    {"name":"Zayn Malik","jenisKelamin":"Laki-laki","tahunLahir":2005,"pendidikan":"SMA 3","statusMondok":"Tidak Sedang Mondok","namaAyah":"Samsul","statusAyah":"jm","namaIbu":"Susi","statusIbu":"jm","desa":"Desa Sejahtera","kelompok":"Remaja"},
    {"name":"Aurel Hermansyah","jenisKelamin":"Perempuan","tahunLahir":2012,"pendidikan":"SD 6","statusMondok":"Tidak Sedang Mondok","namaAyah":"Tatang","statusAyah":"hum","namaIbu":"Tuti","statusIbu":"hum","desa":"Desa Maju","kelompok":"Caberawit"},
    {"name":"Brian Domani","jenisKelamin":"Laki-laki","tahunLahir":2003,"pendidikan":"MAHASISWA","statusMondok":"Tidak Sedang Mondok","namaAyah":"Ujang","statusAyah":"jm","namaIbu":"Uut","statusIbu":"jm","desa":"Desa Jaya","kelompok":"Pra Nikah"}
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('name');
  const [dashboardFilterCategory, setDashboardFilterCategory] = useState('pendidikan');
  const [dashboardFilterValue, setDashboardFilterValue] = useState('Semua');
  
  // States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [generus, setGenerus] = useState<Generus[]>([]);
  const [desas, setDesas] = useState<Desa[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);

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
      const [desasSnap, kelompokSnap, generusSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "desa")),
        getDocs(collection(db, "kelompok")),
        getDocs(collection(db, "generus")),
        getDocs(collection(db, "users")),
      ]);

      const desasData = desasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Desa[];
      setDesas(desasData);

      const kelompokData = kelompokSnap.docs.map(doc => {
        const data = doc.data();
        const desa = desasData.find(d => d.id === data.desaId);
        return { id: doc.id, ...data, desaName: desa?.name || 'N/A' } as Kelompok;
      });
      setKelompok(kelompokData);

      const generusData = generusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Generus[];
      setGenerus(generusData);
      
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);

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

  const handlePopulateGenerus = async () => {
    setIsPopulating(true);
    const toastId = showLoading("Menambahkan 50 data generus ke database...");
    try {
      const batch = writeBatch(db);
      const generusCollection = collection(db, "generus");
      generusSeedData.forEach(data => {
        const docRef = doc(generusCollection);
        batch.set(docRef, data);
      });
      await batch.commit();
      dismissToast(toastId);
      showSuccess("50 data generus berhasil ditambahkan!");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error populating database: ", error);
      dismissToast(toastId);
      showError("Gagal menambahkan data. Periksa aturan keamanan Firebase.");
    } finally {
      setIsPopulating(false);
    }
  };

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
      case 'dashboard':
        return <DashboardSection 
          stats={{ generus: generus.length, desa: desas.length, kelompok: kelompok.length, users: users.length }} 
          generusData={generus}
          dashboardFilterCategory={dashboardFilterCategory}
          setDashboardFilterCategory={setDashboardFilterCategory}
          dashboardFilterValue={dashboardFilterValue}
          setDashboardFilterValue={setDashboardFilterValue}
          onPopulate={handlePopulateGenerus}
          isPopulating={isPopulating}
        />;
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
      case 'akun':
        return <AccountsSection users={users} onDeleteUser={() => {}} />;
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