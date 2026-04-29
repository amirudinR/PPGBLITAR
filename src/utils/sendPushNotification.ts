import { addDoc, collection, getDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationType } from '@/types/notification';

interface SendPushParams {
  targetUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  entityId?: string;
  entityType?: 'm5u' | 'actionItem' | 'checklist' | 'evaluasi';
}

export async function sendPushNotification(params: SendPushParams): Promise<void> {
  const { targetUserId, type, title, body, link, entityId, entityType } = params;

  try {
    await addDoc(collection(db, 'notifications'), {
      userId: targetUserId,
      type,
      title,
      body,
      link,
      read: false,
      createdAt: Timestamp.now(),
      ...(entityId && entityType ? { meta: { entityId, entityType } } : {}),
    });
  } catch (e) {
    console.warn('[Notif] Failed to write in-app notification:', e);
  }

  try {
    const userSnap = await getDoc(doc(db, 'users', targetUserId));
    const fcmToken = userSnap.data()?.fcmToken as string | undefined;
    if (!fcmToken) return;

    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: fcmToken, title, body, link }),
    });
  } catch (e) {
    console.warn('[FCM] Failed to send push notification:', e);
  }
}
