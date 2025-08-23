import { useState, useCallback } from 'react';
import { collection, getDocs, query, where, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonthlyAttendance, User, Kelas } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export function useMonthlyAttendance(currentUser: User | null) {
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = useCallback(async (classId: string, year: number, month: string) => {
    if (!currentUser || !classId) return;
    setLoading(true);
    try {
      const attendanceQuery = query(
        collection(db, "monthlyAttendance"),
        where("classId", "==", classId),
        where("year", "==", year),
        where("month", "==", month),
        where("guruId", "==", currentUser.id) // Filter keamanan ditambahkan di sini
      );
      const attendanceSnap = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MonthlyAttendance[];
      setMonthlyAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching monthly attendance: ", error);
      showError("Gagal memuat data kehadiran.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const saveAttendanceBatch = async (
    attendanceData: { studentId: string; studentName: string; meetingsAttended: number }[],
    selectedClass: Kelas,
    year: number,
    month: string,
    meetingsHeld: number
  ) => {
    if (!currentUser) return;
    const toastId = showLoading("Menyimpan data kehadiran...");
    try {
      const batch = writeBatch(db);
      const attendanceCollection = collection(db, "monthlyAttendance");

      for (const studentData of attendanceData) {
        const docId = `${selectedClass.id}_${studentData.studentId}_${year}_${month}`;
        const docRef = doc(attendanceCollection, docId);
        
        const record: Omit<MonthlyAttendance, 'id'> = {
          studentId: studentData.studentId,
          studentName: studentData.studentName,
          classId: selectedClass.id,
          guruId: currentUser.id,
          desa: selectedClass.desa,
          kelompok: selectedClass.kelompok,
          year,
          month,
          meetingsHeld,
          meetingsAttended: studentData.meetingsAttended,
        };
        batch.set(docRef, record, { merge: true });
      }

      await batch.commit();
      dismissToast(toastId);
      showSuccess("Data kehadiran berhasil disimpan.");
      fetchAttendance(selectedClass.id, year, month);
    } catch (error) {
      dismissToast(toastId);
      showError("Gagal menyimpan data kehadiran.");
      console.error("Error saving attendance batch: ", error);
    }
  };

  return { monthlyAttendance, loading, fetchAttendance, saveAttendanceBatch };
}