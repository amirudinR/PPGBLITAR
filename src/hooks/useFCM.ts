import { useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, messaging } from '@/lib/firebase';
import { User } from '@/types/admin';
import { showError } from '@/utils/toast';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string | undefined;

export function useFCM(currentUser: User | null) {
  const registerToken = useCallback(async () => {
    if (!currentUser?.id || !VAPID_KEY || !messaging) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!token) return;

      await updateDoc(doc(db, 'users', currentUser.id), { fcmToken: token });
    } catch (e) {
      console.warn('[FCM] Token registration failed:', e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !messaging) return;
    registerToken();
  }, [currentUser?.id, registerToken]);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'PPG BLITAR';
      const body = payload.notification?.body ?? '';

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      }
    });

    return () => unsubscribe();
  }, []);
}
