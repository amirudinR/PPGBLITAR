import { useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonthlyAttendance, User } from '@/types/admin';
import { showError } from '@/utils/toast';

export function useAttendanceSummary(currentUser: User | null) {
  const [attendanceSummary, setAttendanceSummary] = useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendanceSummary = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let attendanceQuery = query(collection(db, "monthlyAttendance"));
      if (currentUser.role === 'desa') {
        attendanceQuery = query(attendanceQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        attendanceQuery = query(attendanceQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      
      const attendanceSnap = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MonthlyAttendance[];
      setAttendanceSummary(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance summary: ", error);
      showError("Gagal memuat data rekap kehadiran.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { attendanceSummary, loading, fetchAttendanceSummary };
}