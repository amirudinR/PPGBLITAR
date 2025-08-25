import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const announcementsSnap = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching announcements: ", error);
      showError("Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, "announcements"), { ...data, createdAt: serverTimestamp() });
      fetchAnnouncements();
      showSuccess("Pengumuman berhasil ditambahkan.");
      return true;
    } catch (e) {
      showError("Gagal menambahkan pengumuman.");
      return false;
    }
  };

  const updateAnnouncement = async (id: string, data: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      await updateDoc(doc(db, "announcements", id), data);
      fetchAnnouncements();
      showSuccess("Pengumuman berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui pengumuman.");
      return false;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      fetchAnnouncements();
      showSuccess("Pengumuman berhasil dihapus.");
    } catch (e) {
      showError("Gagal menghapus pengumuman.");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, fetchAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement };
}