import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { M5U, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useM5U(currentUser: User | null) {
  const [m5uItems, setM5uItems] = useState<M5U[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      // Apply role-based filters - untuk PJP Kelompok, coba query tanpa filter dulu
      if (currentUser.role === 'desa') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        // Untuk PJP Kelompok, coba query dengan filter desa dan kelompok
        try {
          m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
        } catch (queryError) {
          // Jika query gagal, coba query hanya dengan desa
          console.log("Query dengan desa dan kelompok gagal, coba hanya dengan desa");
          m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa));
        }
      } else if (currentUser.role === 'guru') {
        m5uQuery = query(m5uQuery, where("guruId", "==", currentUser.id));
      } else if (currentUser.role === 'orangtua') {
        m5uQuery = query(m5uQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      
      const m5uSnap = await getDocs(m5uQuery);
      const m5uData = m5uSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Pastikan field desa dan kelompok ada
        desa: doc.data().desa || currentUser.desa || '',
        kelompok: doc.data().kelompok || currentUser.kelompok || ''
      })) as unknown as M5U[];
      
      setM5uItems(m5uData);
      setHasPermission(true);
      
      // Filter data untuk PJP Kelompok jika perlu
      if (currentUser.role === 'kelompok') {
        const filteredData = m5uData.filter(item => 
          (item as any).desa === currentUser.desa && (item as any).kelompok === currentUser.kelompok
        );
        setM5uItems(filteredData);
      }
      
      // Jika tidak ada data, tampilkan pesan friendly
      if (m5uData.length === 0 && currentUser.role === 'kelompok') {
        console.log("Tidak ada data M5U untuk kelompok ini");
      }
      
    } catch (error: any) {
      console.error("Error fetching M5U data: ", error);
      
      // Handle specific Firebase permission errors
      if (error.code === 'permission-denied') {
        setHasPermission(false);
        // Untuk PJP Kelompok, coba approach alternatif
        if (currentUser.role === 'kelompok') {
          try {
            // Coba query hanya dengan desa
            const alternativeQuery = query(collection(db, "m5u"), where("desa", "==", currentUser.desa));
            const alternativeSnap = await getDocs(alternativeQuery);
            const alternativeData = alternativeSnap.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              desa: doc.data().desa || currentUser.desa || '',
              kelompok: doc.data().kelompok || currentUser.kelompok || ''
            })) as unknown as M5U[];
            
            // Filter manual untuk kelompok
            const filteredData = alternativeData.filter(item => 
              (item as any).kelompok === currentUser.kelompok
            );
            
            setM5uItems(filteredData);
            setHasPermission(true);
            return;
          } catch (alternativeError) {
            console.error("Alternative query also failed:", alternativeError);
          }
        }
        showError("Anda tidak memiliki izin untuk mengakses data M5U. Pastikan Anda memiliki hak akses yang sesuai.");
      } else if (error.code === 'not-found') {
        setHasPermission(true);
        setM5uItems([]); // Set empty array if no data found
      } else if (error.code === 'unavailable') {
        setHasPermission(true);
        showError("Koneksi ke server terputus. Silakan coba lagi.");
      } else if (error.message?.includes('400')) {
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

  useEffect(() => {
    fetchM5U();
  }, [fetchM5U]);

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