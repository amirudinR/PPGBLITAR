import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grade, User, Kelas, Material } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useGrades(currentUser: User | null) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGrades = useCallback(async (classId: string, year: number, month: string, materialId: string) => {
    if (!currentUser || !classId || !materialId) {
      setGrades([]);
      return;
    };
    setLoading(true);
    try {
      const gradesQuery = query(
        collection(db, "grades"),
        where("classId", "==", classId),
        where("year", "==", year),
        where("month", "==", month),
        where("materialId", "==", materialId),
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

  const saveGradesBatch = async (
    gradesToSave: { studentId: string; studentName: string; grade: string }[],
    selectedClass: Kelas,
    selectedMaterial: Material,
    year: number,
    month: string
  ) => {
    if (!currentUser) return;
    const toastId = showLoading("Menyimpan data nilai...");
    try {
      const batch = writeBatch(db);
      const gradesCollection = collection(db, "grades");

      for (const gradeData of gradesToSave) {
        const docId = `${selectedClass.id}_${gradeData.studentId}_${selectedMaterial.id}_${year}_${month}`;
        const docRef = doc(gradesCollection, docId);
        
        const record: Omit<Grade, 'id'> = {
          studentId: gradeData.studentId,
          studentName: gradeData.studentName,
          classId: selectedClass.id,
          materialId: selectedMaterial.id,
          judulMateri: selectedMaterial.judulMateri,
          rincianMateri: selectedMaterial.rincianMateri,
          year,
          month,
          grade: gradeData.grade,
          guruId: currentUser.id,
          desa: selectedClass.desa,
          kelompok: selectedClass.kelompok,
        };
        batch.set(docRef, record, { merge: true });
      }

      await batch.commit();
      dismissToast(toastId);
      showSuccess("Data nilai berhasil disimpan.");
      fetchGrades(selectedClass.id, year, month, selectedMaterial.id);
    } catch (error) {
      dismissToast(toastId);
      showError("Gagal menyimpan data nilai.");
      console.error("Error saving grades batch: ", error);
    }
  };

  return { grades, loading, fetchGrades, saveGradesBatch };
}