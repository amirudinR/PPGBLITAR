import { useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonthlyAttendance, User } from '@/types/admin';
import { showError } from '@/utils/toast';

export function useMonthlyAttendanceSummary(currentUser: User | null) {
  const [allMonthlyAttendance, setAllMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllMonthlyAttendance = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let attendanceQuery = query(collection(db, "monthlyAttendance"));
      if (currentUser.role === 'desa') {
        attendanceQuery = query(attendanceQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        attendanceQuery = query(attendanceQuery, where("kelompok", "==", currentUser.kelompok));
      }
      
      const attendanceSnap = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MonthlyAttendance[];
      setAllMonthlyAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching all monthly attendance: ", error);
      showError("Gagal memuat rekap data kehadiran.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { allMonthlyAttendance, loading, fetchAllMonthlyAttendance };
}