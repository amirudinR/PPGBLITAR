import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LatihanASAD, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useLatihanASAD(currentUser: User | null) {
    const [latihanItems, setLatihanItems] = useState<LatihanASAD[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLatihan = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            let latihanQuery = query(collection(db, "latihanASAD"));

            // Apply role-based filters
            if (currentUser.role === 'desa') {
                latihanQuery = query(latihanQuery, where("desa", "==", currentUser.desa));
            } else if (currentUser.role === 'kelompok') {
                latihanQuery = query(latihanQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
            } else if (currentUser.role === 'guru') {
                latihanQuery = query(latihanQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
            }

            const latihanSnap = await getDocs(latihanQuery);
            const latihanData = latihanSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LatihanASAD[];

            setLatihanItems(latihanData);

        } catch (error: any) {
            console.error("Error fetching Latihan ASAD data: ", error);
            if (error.code === 'permission-denied') {
                showError("Anda tidak memiliki izin untuk mengakses data Latihan ASAD.");
            } else {
                showError("Gagal memuat data Latihan ASAD.");
            }
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const addLatihan = async (data: Omit<LatihanASAD, 'id'>) => {
        const toastId = showLoading("Menyimpan data latihan...");
        try {
            const docRef = await addDoc(collection(db, "latihanASAD"), data);
            setLatihanItems(prev => [...prev, { id: docRef.id, ...data }]);
            dismissToast(toastId);
            showSuccess("Data latihan berhasil ditambahkan.");
            return true;
        } catch (e) {
            dismissToast(toastId);
            showError("Gagal menambahkan data latihan.");
            return false;
        }
    };

    const updateLatihan = async (id: string, data: Omit<LatihanASAD, 'id'>) => {
        const toastId = showLoading("Memperbarui data latihan...");
        try {
            await updateDoc(doc(db, "latihanASAD", id), data);
            setLatihanItems(prev => prev.map(item => item.id === id ? { id, ...data } : item));
            dismissToast(toastId);
            showSuccess("Data latihan berhasil diperbarui.");
            return true;
        } catch (e) {
            dismissToast(toastId);
            showError("Gagal memperbarui data latihan.");
            return false;
        }
    };

    const deleteLatihan = async (id: string) => {
        try {
            await deleteDoc(doc(db, "latihanASAD", id));
            setLatihanItems(prev => prev.filter(item => item.id !== id));
            showSuccess("Data latihan berhasil dihapus.");
        } catch (e) {
            showError("Gagal menghapus data latihan.");
        }
    };

    // Get statistics
    const getStatistics = useCallback(() => {
        const total = latihanItems.length;
        const tercapai = latihanItems.filter(item => item.status === 'Tercapai').length;
        const tidakTercapai = latihanItems.filter(item => item.status === 'Tidak Tercapai').length;
        const dalamProses = latihanItems.filter(item => item.status === 'Dalam Proses').length;
        const persentaseTercapai = total > 0 ? Math.round((tercapai / total) * 100) : 0;

        return { total, tercapai, tidakTercapai, dalamProses, persentaseTercapai };
    }, [latihanItems]);

    useEffect(() => {
        fetchLatihan();
    }, [fetchLatihan]);

    return {
        latihanItems,
        loading,
        fetchLatihan,
        addLatihan,
        updateLatihan,
        deleteLatihan,
        getStatistics
    };
}
