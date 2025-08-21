import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Material, JUDUL_MATERI_LIST, KELAS_MATERI_LIST } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id'>>({
    judulMateri: JUDUL_MATERI_LIST[0], rincianMateri: '', kelas: KELAS_MATERI_LIST[0], semester: 'Ganjil', targetBulan: ''
  });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const materialsSnap = await getDocs(collection(db, "materials"));
      const materialsData = materialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Material[];
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error fetching materials: ", error);
      showError("Gagal memuat data materi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addMaterial = async () => {
    if (!newMaterial.judulMateri) { showError("Judul materi harus diisi."); return false; }
    try {
      await addDoc(collection(db, "materials"), newMaterial);
      fetchMaterials();
      setNewMaterial({
        judulMateri: JUDUL_MATERI_LIST[0], rincianMateri: '', kelas: KELAS_MATERI_LIST[0], semester: 'Ganjil', targetBulan: ''
      });
      showSuccess("Materi berhasil ditambahkan.");
      return true;
    } catch (e) { showError("Gagal menambahkan materi."); return false; }
  };

  const updateMaterial = async (id: string, updatedData: Omit<Material, 'id'>) => {
    try {
      await updateDoc(doc(db, "materials", id), updatedData);
      fetchMaterials();
      showSuccess("Materi berhasil diperbarui.");
      return true;
    } catch (e) { showError("Gagal memperbarui materi."); return false; }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, "materials", id));
      fetchMaterials();
      showSuccess("Materi berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus materi."); }
  };

  const deleteMultipleMaterials = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const docRef = doc(db, "materials", id);
        batch.delete(docRef);
      });
      await batch.commit();
      fetchMaterials();
      showSuccess(`${ids.length} materi berhasil dihapus.`);
    } catch (e) {
      showError("Gagal menghapus materi yang dipilih.");
    }
  };

  return { materials, loading, fetchMaterials, newMaterial, setNewMaterial, addMaterial, updateMaterial, deleteMaterial, deleteMultipleMaterials };
}