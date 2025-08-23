import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grade, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useGrades(currentUser: User | null) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllGradesForClass = useCallback(async (classId: string) => {
    if (!currentUser || !classId) {
      setGrades([]);
      return;
    };
    setLoading(true);
    try {
      const gradesQuery = query(
        collection(db, "grades"),
        where("classId", "==", classId),
        where("guruId", "==", currentUser.id)
      );
      const gradesSnap = await getDocs(gradesQuery);
      const gradesData = gradesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Grade[];
      setGrades(gradesData);
    } catch (error) {
      console.error("Error fetching grades: ", error);
      showError("Gagal memuat data nilai.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const saveGradesBatch = async (gradesToSave: Omit<Grade, 'id'>[]) => {
    if (!currentUser) {
      showError("Pengguna tidak ditemukan.");
      return false;
    }
    const toastId = showLoading("Menyimpan data nilai...");
    try {
      const batch = writeBatch(db);
      const gradesCollection = collection(db, "grades");

      for (const gradeData of gradesToSave) {
        const { classId, studentId, materialId, year, month } = gradeData;
        const docId = `${classId}_${studentId}_${materialId}_${year}_${month}`;
        const docRef = doc(gradesCollection, docId);
        batch.set(docRef, gradeData, { merge: true });
      }

      await batch.commit();
      dismissToast(toastId);
      showSuccess("Data nilai berhasil disimpan.");
      return true;
    } catch (error) {
      dismissToast(toastId);
      showError("Gagal menyimpan data nilai.");
      console.error("Error saving grades batch: ", error);
      return false;
    }
  };

  return { grades, loading, fetchGrades: fetchAllGradesForClass, saveGradesBatch };
}