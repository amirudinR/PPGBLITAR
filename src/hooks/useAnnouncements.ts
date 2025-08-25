import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement, User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useAnnouncements(currentUser: User | null) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!currentUser) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      let announcementsQuery;
      if (currentUser.role === 'adminsuper' || currentUser.role === 'admin') {
        announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      } else {
        announcementsQuery = query(
            collection(db, "announcements"), 
            where("targetRoles", "array-contains", currentUser.role),
            orderBy("createdAt", "desc")
        );
      }
      const announcementsSnap = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnap.docs.map(doc => Object.assign({ id: doc.id }, doc.data())) as Announcement[];
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching announcements: ", error);
      showError("Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

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