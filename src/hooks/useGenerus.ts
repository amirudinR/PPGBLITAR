import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Generus, User, Desa, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';
import { generusSeedData } from '@/data/seed';
import { useBatchOperations } from './useBatchOperations';

export function useGenerus(currentUser: User | null) {
  const [generus, setGenerus] = useState<Generus[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [newGenerus, setNewGenerus] = useState<Omit<Generus, 'id'>>({
    name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, tanggalLahir: '',
    pendidikan: PENDIDIKAN_LIST[0], jurusan: '',
    aktivitas: '', pekerjaan: '', statusMondok: STATUS_MONDOK_LIST[3], tugas: '',
    mt: 'Belum MT',
    namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
    desa: '', kelompok: ''
  });

  const { batchImport, batchAddWithCustomRefs } = useBatchOperations();

  const fetchGenerus = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let generusQuery;

      if (currentUser.role === 'guru') {
        // For gurus, we must query based on security rules (desa/kelompok) and filter client-side.
        // 1. Find the guru's document ID
        const guruQuery = query(collection(db, "gurus"), where("userId", "==", currentUser.id));
        const guruSnap = await getDocs(guruQuery);
        if (guruSnap.empty) {
          setGenerus([]);
          setLoading(false);
          return;
        }
        const guruDoc = guruSnap.docs[0];

        // 2. Find classes taught by this guru by fetching all in their kelompok and filtering
        const kelasQuery = query(collection(db, "kelas"), where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
        const kelasSnap = await getDocs(kelasQuery);
        const guruKelas = kelasSnap.docs
          .map(doc => doc.data() as any)
          .filter(k => k.guruId === guruDoc.id);

        // 3. Collect all student IDs from these classes
        let studentIds: string[] = [];
        guruKelas.forEach(kelasData => {
          if (kelasData.studentIds && Array.isArray(kelasData.studentIds)) {
            studentIds = studentIds.concat(kelasData.studentIds);
          }
        });
        
        const uniqueStudentIds = [...new Set(studentIds)];

        // 4. Fetch all generus in the guru's kelompok and filter by the student IDs
        if (uniqueStudentIds.length > 0) {
          const allGenerusInKelompokQuery = query(collection(db, "generus"), where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
          const generusSnap = await getDocs(allGenerusInKelompokQuery);
          const generusData = generusSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }) as Generus)
            .filter(g => uniqueStudentIds.includes(g.id));
          setGenerus(generusData);
        } else {
          setGenerus([]);
        }
        return; // Exit after handling guru case
      }
      
      // Existing logic for other roles
      generusQuery = query(collection(db, "generus"));
      if (currentUser.role === 'desa') {
        generusQuery = query(generusQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        generusQuery = query(generusQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const generusSnap = await getDocs(generusQuery);
      const generusData = generusSnap.docs.map(doc => Object.assign({ id: doc.id }, doc.data())) as Generus[];
      setGenerus(generusData);

    } catch (error) {
      console.error("Error fetching generus: ", error);
      showError("Gagal memuat data generus.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addGenerus = async () => {
    if (!newGenerus.name) { showError("Nama harus diisi."); return false; }
    try {
      await addDoc(collection(db, "generus"), newGenerus);
      fetchGenerus();
      setNewGenerus({
        name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, tanggalLahir: '',
        pendidikan: PENDIDIKAN_LIST[0], jurusan: '',
        aktivitas: '', pekerjaan: '', statusMondok: STATUS_MONDOK_LIST[3], tugas: '',
        mt: 'Belum MT',
        namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
        desa: '', kelompok: ''
      });
      return true;
    } catch (e) { showError("Gagal menambahkan generus."); return false; }
  };

  // Memperbaiki fungsi import data Generus
  const importGenerus = async (data: Omit<Generus, 'id'>[]) => {
    try {
      await batchImport({
        data,
        collectionName: "generus",
        db,
        successMessage: `${data.length} data generus berhasil diimpor.`,
        loadingMessage: `Mengimpor ${data.length} data generus...`
      });
      fetchGenerus();
      return true;
    } catch (error) {
      showError("Gagal mengimpor data generus.");
      return false;
    }
  };

  const updateGenerus = async (id: string, data: Omit<Generus, 'id'>) => {
    try {
      await updateDoc(doc(db, "generus", id), data);
      fetchGenerus();
      showSuccess("Data generus berhasil diperbarui.");
      return true;
    } catch (e) { showError("Gagal memperbarui data generus."); return false; }
  };

  // Memperbaiki fungsi hapus data Generus dengan penanganan error yang lebih baik
  const deleteGenerus = async (id: string) => {
    try {
      // Validasi ID sebelum menghapus
      if (!id || typeof id !== 'string') {
        showError("ID generus tidak valid.");
        return;
      }

      // Cek permission sebelum mencoba menghapus
      if (currentUser?.role === 'kelompok') {
        // Untuk PJP Kelompok, pastikan data milik kelompoknya
        const generusDoc = await getDoc(doc(db, "generus", id));
        if (!generusDoc.exists()) {
          showError("Data generus tidak ditemukan.");
          return;
        }
        
        const generusData = generusDoc.data();
        if (generusData.desa !== currentUser.desa || generusData.kelompok !== currentUser.kelompok) {
          showError("Anda tidak memiliki izin untuk menghapus data generus dari kelompok lain.");
          return;
        }
      }

      // Coba hapus dokumen
      await deleteDoc(doc(db, "generus", id));
      
      // Refresh data setelah hapus
      await fetchGenerus();
      showSuccess("Data generus berhasil dihapus.");
    } catch (error: any) {
      console.error("Error deleting generus: ", error);
      
      // Tangani error spesifik Firebase
      if (error.code === 'permission-denied') {
        showError("Anda tidak memiliki izin untuk menghapus data ini. Pastikan Anda memiliki hak akses yang sesuai.");
      } else if (error.code === 'not-found') {
        showError("Data generus tidak ditemukan.");
      } else if (error.code === 'unavailable') {
        showError("Koneksi ke server terputus. Silakan coba lagi.");
      } else if (error.message?.includes('400')) {
        showError("Permintaan tidak valid. Silakan coba lagi.");
      } else {
        showError("Gagal menghapus data generus. Silakan coba lagi atau hubungi administrator.");
      }
    }
  };

  const populateGenerus = async (desas: Desa[], kelompok: Kelompok[]) => {
    if (desas.length === 0 || kelompok.length === 0) {
      showError("Harap tambahkan data Desa dan Kelompok terlebih dahulu.");
      return;
    }
    setIsPopulating(true);
    try {
      const seedData = generusSeedData.map(g => {
        const randomDesa = desas[Math.floor(Math.random() * desas.length)];
        const kelompokInDesa = kelompok.filter(k => k.desaId === randomDesa.id);
        let selectedKelompokName = kelompokInDesa.length > 0 ? kelompokInDesa[Math.floor(Math.random() * kelompokInDesa.length)].name : '';
        return { ...g, desa: randomDesa.name, kelompok: selectedKelompokName };
      });

      await batchImport({
        data: seedData,
        collectionName: "generus",
        db,
        successMessage: "50 data generus berhasil ditambahkan!",
        loadingMessage: "Menambahkan 50 data generus ke database..."
      });
      fetchGenerus();
    } catch (error) {
      showError("Gagal menambahkan data.");
    } finally {
      setIsPopulating(false);
    }
  };

  return { 
    generus, 
    loading, 
    fetchGenerus, 
    newGenerus, 
    setNewGenerus, 
    addGenerus, 
    importGenerus, // Tambahkan fungsi import
    updateGenerus, 
    deleteGenerus, 
    isPopulating, 
    populateGenerus 
  };
}