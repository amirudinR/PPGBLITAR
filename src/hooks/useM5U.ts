import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { M5U, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useM5U(currentUser: User | null) {
  const [m5uItems, setM5uItems] = useState<M5U[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchM5U = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let m5uQuery = query(collection(db, "m5u"));
      
      // Apply role-based security filters first
      if (currentUser.role === 'guru') {
        m5uQuery = query(m5uQuery, where("guruId", "==", currentUser.id));
      } else if (currentUser.role === 'kelompok') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      } else if (currentUser.role === 'desa') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'orangtua') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      // For admins, no additional filter needed - they can see all
      
      const m5uSnap = await getDocs(m5uQuery);
      const m5uData = m5uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as M5U[];
      setM5uItems(m5uData);
    } catch (error: any) {
      console.error("Error fetching M5U data: ", error);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for M5U data. User role:", currentUser.role);
        // Don't show error toast for permission issues, just log it
        setM5uItems([]); // Set empty array instead of showing error
      } else if (error.code === 'unavailable') {
        showError("Koneksi ke server terputus. Silakan coba lagi.");
      } else {
        showError("Gagal memuat data M5U.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addM5U = async (data: Omit<M5U, 'id'>) => {
    try {
      // Ensure required fields are present for role-based access control
      const dataWithMetadata = {
        ...data,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.id || ''
      };
      
      await addDoc(collection(db, "m5u"), dataWithMetadata);
      fetchM5U();
      showSuccess("Agenda M5U berhasil ditambahkan.");
      return true;
    } catch (e: any) {
      console.error("Error adding M5U: ", e);
      if (e.code === 'permission-denied') {
        showError("Anda tidak memiliki izin untuk menambahkan agenda M5U.");
      } else {
        showError("Gagal menambahkan agenda M5U.");
      }
      return false;
    }
  };

  const updateM5U = async (id: string, data: Omit<M5U, 'id'>) => {
    try {
      await updateDoc(doc(db, "m5u", id), data);
      fetchM5U();
      showSuccess("Agenda M5U berhasil diperbarui.");
      return true;
    } catch (e: any) {
      console.error("Error updating M5U: ", e);
      if (e.code === 'permission-denied') {
        showError("Anda tidak memiliki izin untuk memperbarui agenda M5U.");
      } else {
        showError("Gagal memperbarui agenda M5U.");
      }
      return false;
    }
  };

  const deleteM5U = async (id: string) => {
    try {
      await deleteDoc(doc(db, "m5u", id));
      fetchM5U();
      showSuccess("Agenda M5U berhasil dihapus.");
    } catch (e: any) {
      console.error("Error deleting M5U: ", e);
      if (e.code === 'permission-denied') {
        showError("Anda tidak memiliki izin untuk menghapus agenda M5U.");
      } else {
        showError("Gagal menghapus agenda M5U.");
      }
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
    } catch (e: any) {
      console.error("Error deleting multiple M5U: ", e);
      if (e.code === 'permission-denied') {
        showError("Anda tidak memiliki izin untuk menghapus agenda M5U.");
      } else {
        showError("Gagal menghapus agenda M5U.");
      }
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

  useEffect(() => {
    fetchM5U();
  }, [fetchM5U]);

  return { 
    m5uItems, 
    loading, 
    fetchM5U, 
    addM5U, 
    updateM5U, 
    deleteM5U, 
    deleteMultipleM5U,
    isM5UNotImplemented
  };
}