import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement } from '@/types/admin';
import { showError } from '@/utils/toast';

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

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, fetchAnnouncements };
}