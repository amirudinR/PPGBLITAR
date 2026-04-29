import { useState, useCallback, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, writeBatch, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppNotification } from '@/types/notification';
import { User } from '@/types/admin';
import { showError } from '@/utils/toast';

export function useNotifications(currentUser: User | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.id),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() })) as AppNotification[];
        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      showError('Gagal menandai notifikasi.');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
    } catch (e) {
      showError('Gagal menandai semua notifikasi.');
    }
  }, [notifications]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
