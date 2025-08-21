import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Kelompok, Desa } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useKelompok(desas: Desa[]) {
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKelompok = useCallback(async () => {
    setLoading(true);
    try {
      const kelompokSnap = await getDocs(collection(db, "kelompok"));
      const kelompokData = kelompokSnap.docs.map(doc => {
        const data = doc.data();
        const desa = desas.find(d => d.id === data.desaId);
        return { id: doc.id, ...data, desaName: desa?.name || 'N/A' } as Kelompok;
      });
      setKelompok(kelompokData);
    } catch (error) {
      console.error("Error fetching kelompok: ", error);
      showError("Gagal memuat data kelompok.");
    } finally {
      setLoading(false);
    }
  }, [desas]);

  const addKelompok = async (name: string, desaId: string) => {
    if (!name.trim() || !desaId) { showError("Nama kelompok dan desa harus diisi."); return false; }
    try {
      await addDoc(collection(db, "kelompok"), { name: name.trim(), desaId });
      fetchKelompok();
      return true;
    } catch (e) { showError("Gagal menambahkan kelompok."); return false; }
  };

  const updateKelompok = async (id: string, newName: string, newDesaId: string) => {
    if (!newName.trim() || !newDesaId) { showError("Nama kelompok dan desa harus diisi."); return false; }
    try {
      await updateDoc(doc(db, "kelompok", id), { name: newName.trim(), desaId: newDesaId });
      fetchKelompok();
      return true;
    } catch (e) { showError("Gagal memperbarui kelompok."); return false; }
  };

  const deleteKelompok = async (id: string) => {
    try {
      await deleteDoc(doc(db, "kelompok", id));
      fetchKelompok();
      showSuccess("Kelompok berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus kelompok."); }
  };

  return { kelompok, loading, fetchKelompok, addKelompok, updateKelompok, deleteKelompok };
}