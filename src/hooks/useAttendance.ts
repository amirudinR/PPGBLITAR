import { useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Attendance, User } from '@/types/admin';
import { showError } from '@/utils/toast';

export function useAttendance(currentUser: User | null) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let attendanceQuery = query(collection(db, "attendance"));
      if (currentUser.role === 'desa') {
        attendanceQuery = query(attendanceQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        attendanceQuery = query(attendanceQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const attendanceSnap = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Attendance[];
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance: ", error);
      showError("Gagal memuat data kehadiran.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { attendance, loading, fetchAttendance };
}