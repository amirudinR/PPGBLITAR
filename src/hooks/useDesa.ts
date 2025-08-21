import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Desa } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useDesa() {
  const [desas, setDesas] = useState<Desa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesas = useCallback(async () => {
    setLoading(true);
    try {
      const desasSnap = await getDocs(collection(db, "desa"));
      const desasData = desasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Desa[];
      setDesas(desasData);
    } catch (error) {
      console.error("Error fetching desas: ", error);
      showError("Gagal memuat data desa.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addDesa = async (name: string) => {
    if (!name.trim()) { showError("Nama desa tidak boleh kosong."); return false; }
    try {
      await addDoc(collection(db, "desa"), { name: name.trim() });
      fetchDesas();
      return true;
    } catch (e) { showError("Gagal menambahkan desa."); return false; }
  };

  const updateDesa = async (id: string, newName: string) => {
    if (!newName.trim()) { showError("Nama desa tidak boleh kosong."); return false; }
    try {
      await updateDoc(doc(db, "desa", id), { name: newName.trim() });
      fetchDesas();
      return true;
    } catch (e) { showError("Gagal memperbarui desa."); return false; }
  };

  const deleteDesa = async (id: string) => {
    try {
      await deleteDoc(doc(db, "desa", id));
      fetchDesas();
      showSuccess("Desa berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus desa."); }
  };

  return { desas, loading, fetchDesas, addDesa, updateDesa, deleteDesa };
}