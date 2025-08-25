import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Kelas, User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useKelas(currentUser: User | null) {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKelas = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let kelasQuery = query(collection(db, "kelas"));
      if (currentUser.role === 'desa') {
        kelasQuery = query(kelasQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        kelasQuery = query(kelasQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const kelasSnap = await getDocs(kelasQuery);
      const kelasData = kelasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Kelas[];
      setKelas(kelasData);
    } catch (error) {
      console.error("Error fetching kelas: ", error);
      showError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addKelas = async (kelasData: Omit<Kelas, 'id'>) => {
    if (!kelasData.namaKelas || !kelasData.guruId || !kelasData.jenjangUsia) {
      showError("Semua field harus diisi.");
      return false;
    }
    try {
      const dataToSave = { ...kelasData, studentIds: kelasData.studentIds || [] };
      await addDoc(collection(db, "kelas"), dataToSave);
      fetchKelas();
      showSuccess("Kelas berhasil ditambahkan.");
      return true;
    } catch (e) {
      showError("Gagal menambahkan kelas.");
      return false;
    }
  };

  const updateKelas = async (id: string, kelasData: Omit<Kelas, 'id'>) => {
    try {
      await updateDoc(doc(db, "kelas", id), kelasData);
      fetchKelas();
      showSuccess("Kelas berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui kelas.");
      return false;
    }
  };

  const deleteKelas = async (id: string) => {
    try {
      await deleteDoc(doc(db, "kelas", id));
      fetchKelas();
      showSuccess("Kelas berhasil dihapus.");
    } catch (e) {
      showError("Gagal menghapus kelas.");
    }
  };

  return { kelas, loading, fetchKelas, addKelas, updateKelas, deleteKelas };
}