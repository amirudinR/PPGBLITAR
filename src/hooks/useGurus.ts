import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Guru, User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useGurus(currentUser: User | null) {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGurus = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let gurusQuery = query(collection(db, "gurus"));
      if (currentUser.role === 'desa') {
        gurusQuery = query(gurusQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        gurusQuery = query(gurusQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const gurusSnap = await getDocs(gurusQuery);
      const gurusData = gurusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guru[];
      setGurus(gurusData);
    } catch (error) {
      console.error("Error fetching gurus: ", error);
      showError("Gagal memuat data guru.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addGuru = async (guruData: Omit<Guru, 'id'>) => {
    if (!guruData.name || !guruData.phone) {
      showError("Nama dan No HP harus diisi.");
      return false;
    }
    try {
      await addDoc(collection(db, "gurus"), guruData);
      fetchGurus();
      showSuccess("Data guru berhasil ditambahkan.");
      return true;
    } catch (e) {
      showError("Gagal menambahkan data guru.");
      return false;
    }
  };

  const updateGuru = async (id: string, guruData: Omit<Guru, 'id'>) => {
    try {
      await updateDoc(doc(db, "gurus", id), guruData);
      fetchGurus();
      showSuccess("Data guru berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui data guru.");
      return false;
    }
  };

  const deleteGuru = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gurus", id));
      fetchGurus();
      showSuccess("Data guru berhasil dihapus.");
    } catch (e) {
      showError("Gagal menghapus data guru.");
    }
  };

  return { gurus, loading, fetchGurus, addGuru, updateGuru, deleteGuru };
}