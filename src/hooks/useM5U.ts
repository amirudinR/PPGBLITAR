import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { M5U, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useM5U(currentUser: User | null) {
  const [m5uItems, setM5uItems] = useState<M5U[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchM5U = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setHasPermission(true);
    
    try {
      let m5uQuery = query(collection(db, "m5u"));

      if (currentUser.role === 'desa') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      } else if (currentUser.role === 'guru') {
        m5uQuery = query(m5uQuery, where("guruId", "==", currentUser.id));
      } else if (currentUser.role === 'orangtua') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }

      const m5uSnap = await getDocs(m5uQuery);
      const m5uData = m5uSnap.docs.map(snapshot => {
        const data = snapshot.data() as Omit<M5U, 'id'>;
        return {
          id: snapshot.id,
          ...data,
          desa: data.desa || currentUser.desa || '',
          kelompok: data.kelompok || currentUser.kelompok || '',
          guruId: data.guruId || '',
        };
      });

      setM5uItems(m5uData);
      setHasPermission(true);
    } catch (error: any) {
      console.error("Error fetching M5U data: ", error);
      
      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === 'permission-denied') {
        setHasPermission(false);
        showError("Anda tidak memiliki izin untuk mengakses data M5U. Pastikan Anda memiliki hak akses yang sesuai.");
      } else if (firebaseError.code === 'not-found') {
        setHasPermission(true);
        setM5uItems([]);
      } else if (firebaseError.code === 'unavailable') {
        setHasPermission(true);
        showError("Koneksi ke server terputus. Silakan coba lagi.");
      } else if (firebaseError.message?.includes('400')) {
        setHasPermission(true);
        showError("Permintaan tidak valid. Silakan coba lagi.");
      } else {
        setHasPermission(true);
        showError("Gagal memuat data M5U. Silakan coba lagi atau hubungi administrator.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addM5U = async (data: Omit<M5U, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "m5u"), data);
      setM5uItems(prev => [...prev, { id: docRef.id, ...data }]);
      showSuccess("Agenda M5U berhasil ditambahkan.");
      return true;
    } catch (e) {
      showError("Gagal menambahkan agenda M5U.");
      return false;
    }
  };

  const updateM5U = async (id: string, data: Omit<M5U, 'id'>) => {
    try {
      await updateDoc(doc(db, "m5u", id), data);
      setM5uItems(prev => prev.map(item => item.id === id ? { id, ...data } : item));
      showSuccess("Agenda M5U berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui agenda M5U.");
      return false;
    }
  };

  const deleteM5U = async (id: string) => {
    try {
      await deleteDoc(doc(db, "m5u", id));
      setM5uItems(prev => prev.filter(item => item.id !== id));
      showSuccess("Agenda M5U berhasil dihapus.");
    } catch (e) {
      showError("Gagal menghapus agenda M5U.");
    }
  };

  const deleteMultipleM5U = async (bulan: string, tahun: number) => {
    try {
      const batch = writeBatch(db);
      const itemsToDelete = m5uItems.filter(item => item.bulan === bulan && item.tahun === tahun);
      
      itemsToDelete.forEach(item => {
        const docRef = doc(db, "m5u", item.id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      setM5uItems(prev => prev.filter(item => !(item.bulan === bulan && item.tahun === tahun)));
      showSuccess(`Agenda M5U bulan ${bulan} ${tahun} berhasil dihapus.`);
    } catch (e) {
      showError("Gagal menghapus agenda M5U.");
    }
  };

  // Check if M5U has been implemented for current month
  const isM5UNotImplemented = useCallback(() => {
    if (!currentUser || currentUser.role === 'guru' || currentUser.role === 'orangtua') {
      return false;
    }
    
    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    return !m5uItems.some(item => 
      item.bulan === currentMonth && 
      item.tahun === currentYear
    );
  }, [m5uItems, currentUser]);

  return { 
    m5uItems, 
    loading, 
    hasPermission,
    fetchM5U, 
    addM5U, 
    updateM5U, 
    deleteM5U, 
    deleteMultipleM5U,
    isM5UNotImplemented
  };
}