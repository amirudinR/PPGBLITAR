import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JariyahPPG, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useJariyahPPG(currentUser: User | null) {
    const [jariyahItems, setJariyahItems] = useState<JariyahPPG[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchJariyah = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            let jariyahQuery = query(collection(db, "jariyahPPG"));

            // Apply role-based filters
            if (currentUser.role === 'desa') {
                jariyahQuery = query(jariyahQuery, where("desa", "==", currentUser.desa));
            } else if (currentUser.role === 'kelompok') {
                jariyahQuery = query(jariyahQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
            } else if (currentUser.role === 'guru') {
                jariyahQuery = query(jariyahQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
            }

            const jariyahSnap = await getDocs(jariyahQuery);
            const jariyahData = jariyahSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as JariyahPPG[];

            setJariyahItems(jariyahData);

        } catch (error: any) {
            console.error("Error fetching Jariyah PPG data: ", error);
            if (error.code === 'permission-denied') {
                showError("Anda tidak memiliki izin untuk mengakses data Jariyah PPG.");
            } else {
                showError("Gagal memuat data Jariyah PPG.");
            }
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const addJariyah = async (data: Omit<JariyahPPG, 'id'>) => {
        const toastId = showLoading("Menyimpan data jariyah...");
        try {
            const docRef = await addDoc(collection(db, "jariyahPPG"), data);
            setJariyahItems(prev => [...prev, { id: docRef.id, ...data }]);
            dismissToast(toastId);
            showSuccess("Data jariyah berhasil ditambahkan.");
            return true;
        } catch (e) {
            dismissToast(toastId);
            showError("Gagal menambahkan data jariyah.");
            return false;
        }
    };

    const updateJariyah = async (id: string, data: Omit<JariyahPPG, 'id'>) => {
        const toastId = showLoading("Memperbarui data jariyah...");
        try {
            await updateDoc(doc(db, "jariyahPPG", id), data);
            setJariyahItems(prev => prev.map(item => item.id === id ? { id, ...data } : item));
            dismissToast(toastId);
            showSuccess("Data jariyah berhasil diperbarui.");
            return true;
        } catch (e) {
            dismissToast(toastId);
            showError("Gagal memperbarui data jariyah.");
            return false;
        }
    };

    const deleteJariyah = async (id: string) => {
        try {
            await deleteDoc(doc(db, "jariyahPPG", id));
            setJariyahItems(prev => prev.filter(item => item.id !== id));
            showSuccess("Data jariyah berhasil dihapus.");
        } catch (e) {
            showError("Gagal menghapus data jariyah.");
        }
    };

    // Get statistics
    const getStatistics = useCallback(() => {
        const total = jariyahItems.length;
        const totalNominal = jariyahItems.reduce((sum, item) => sum + (item.nominal || 0), 0);
        const diterima = jariyahItems.filter(item => item.status === 'Diterima').length;
        const pending = jariyahItems.filter(item => item.status === 'Pending').length;
        const nominalDiterima = jariyahItems
            .filter(item => item.status === 'Diterima')
            .reduce((sum, item) => sum + (item.nominal || 0), 0);

        // Group by jenis jariyah
        const byJenis = jariyahItems.reduce((acc, item) => {
            acc[item.jenisJariyah] = (acc[item.jenisJariyah] || 0) + item.nominal;
            return acc;
        }, {} as Record<string, number>);

        return { total, totalNominal, diterima, pending, nominalDiterima, byJenis };
    }, [jariyahItems]);

    return {
        jariyahItems,
        loading,
        fetchJariyah,
        addJariyah,
        updateJariyah,
        deleteJariyah,
        getStatistics
    };
}
