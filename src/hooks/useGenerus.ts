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
        const guruQuery = query(collection(db, "gurus"), where("userId", "==", currentUser.id));
        const guruSnap = await getDocs(guruQuery);
        if (guruSnap.empty) {
          setGenerus([]);
          return;
        }
        const guruDoc = guruSnap.docs[0];
        const kelasQuery = query(collection(db, "kelas"), where("guruId", "==", guruDoc.id));
        const kelasSnap = await getDocs(kelasQuery);
        if (kelasSnap.empty) {
          setGenerus([]);
          return;
        }
        let studentIds: string[] = [];
        kelasSnap.forEach(doc => {
          const kelasData = doc.data();
          if (kelasData.studentIds && Array.isArray(kelasData.studentIds)) {
            studentIds = studentIds.concat(kelasData.studentIds);
          }
        });
        const uniqueStudentIds = [...new Set(studentIds)];
        if (uniqueStudentIds.length > 0) {
          const chunks = [];
          for (let i = 0; i < uniqueStudentIds.length; i += 30) {
            chunks.push(uniqueStudentIds.slice(i, i + 30));
          }
          const generusData: Generus[] = [];
          for (const chunk of chunks) {
            generusQuery = query(collection(db, "generus"), where(documentId(), "in", chunk));
            const generusSnap = await getDocs(generusQuery);
            generusSnap.forEach(doc => {
              generusData.push(Object.assign({ id: doc.id }, doc.data()) as Generus);
            });
          }
          setGenerus(generusData);
        } else {
          setGenerus([]);
        }
        return;
      }
      
      generusQuery = query(collection(db, "generus"));
      if (currentUser.role === 'desa') {
        generusQuery = query(generusQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        generusQuery = query(generusQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const generusSnap = await getDocs(generusQuery);
      const generusData = generusSnap.docs.map(doc => Object.assign({ id: doc.id }, doc.data()) as Generus);
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

  const addMultipleGenerus = async (generusToAdd: Omit<Generus, 'id'>[]) => {
    if (generusToAdd.length === 0) {
      showError("Tidak ada data untuk ditambahkan.");
      return false;
    }
    const toastId = showLoading(`Menambahkan ${generusToAdd.length} data generus...`);
    try {
      const batch = writeBatch(db);
      const generusCollection = collection(db, "generus");
      generusToAdd.forEach(generus => {
        const docRef = doc(generusCollection);
        batch.set(docRef, generus);
      });
      await batch.commit();
      dismissToast(toastId);
      showSuccess(`${generusToAdd.length} data generus berhasil diunggah.`);
      fetchGenerus();
      return true;
    } catch (e) {
      dismissToast(toastId);
      showError("Gagal mengunggah data generus dari Excel.");
      console.error(e);
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

  const deleteGenerus = async (id: string) => {
    try {
      await deleteDoc(doc(db, "generus", id));
      fetchGenerus();
      showSuccess("Data generus berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus data generus."); }
  };

  return { generus, loading, fetchGenerus, newGenerus, setNewGenerus, addGenerus, updateGenerus, deleteGenerus, addMultipleGenerus };
}