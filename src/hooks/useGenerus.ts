import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Generus, User, Desa, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { generusSeedData } from '@/data/seed';

export function useGenerus(currentUser: User | null) {
  const [generus, setGenerus] = useState<Generus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);
  const [newGenerus, setNewGenerus] = useState<Omit<Generus, 'id'>>({
    name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, pendidikan: PENDIDIKAN_LIST[0],
    statusMondok: STATUS_MONDOK_LIST[3], namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
    desa: '', kelompok: ''
  });

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
        name: '', jenisKelamin: 'Laki-laki', tahunLahir: 2010, pendidikan: PENDIDIKAN_LIST[0],
        statusMondok: STATUS_MONDOK_LIST[3], namaAyah: '', statusAyah: '', namaIbu: '', statusIbu: '',
        desa: '', kelompok: ''
      });
      return true;
    } catch (e) { showError("Gagal menambahkan generus."); return false; }
  };

  const updateGenerus = async (id: string, data: Omit<Generus, 'id'>) => {
    try {
      await updateDoc(doc(db, "generus", id), data);
      fetchGenerus();
      showSuccess("Data generus berhasil diperbarui.");
      return true;
    } catch (e) { showError("Gagal memperbarui data generus."); return false; }
  };

  const deleteGenerus = async (id: string) => {
    try {
      await deleteDoc(doc(db, "generus", id));
      fetchGenerus();
      showSuccess("Data generus berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus data generus."); }
  };

  const populateGenerus = async (desas: Desa[], kelompok: Kelompok[]) => {
    if (desas.length === 0 || kelompok.length === 0) {
      showError("Harap tambahkan data Desa dan Kelompok terlebih dahulu.");
      return;
    }
    setIsPopulating(true);
    const toastId = showLoading("Menambahkan 50 data generus ke database...");
    try {
      const batch = writeBatch(db);
      const generusCollection = collection(db, "generus");
      generusSeedData.forEach(g => {
        const randomDesa = desas[Math.floor(Math.random() * desas.length)];
        const kelompokInDesa = kelompok.filter(k => k.desaId === randomDesa.id);
        let selectedKelompokName = kelompokInDesa.length > 0 ? kelompokInDesa[Math.floor(Math.random() * kelompokInDesa.length)].name : '';
        const docRef = doc(generusCollection);
        batch.set(docRef, { ...g, desa: randomDesa.name, kelompok: selectedKelompokName });
      });
      await batch.commit();
      dismissToast(toastId);
      showSuccess("50 data generus berhasil ditambahkan!");
      fetchGenerus();
    } catch (error) {
      console.error("Error populating database: ", error);
      dismissToast(toastId);
      showError("Gagal menambahkan data.");
    } finally {
      setIsPopulating(false);
    }
  };

  return { generus, loading, fetchGenerus, newGenerus, setNewGenerus, addGenerus, updateGenerus, deleteGenerus, isPopulating, populateGenerus };
}