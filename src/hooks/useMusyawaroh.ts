import { useState, useCallback, useEffect } from 'react';
import {
  collection, query, where, getDocs, addDoc, updateDoc,
  deleteDoc, doc, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { M5U, M5UAttendee, M5UActionItem, User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';
import { sendPushNotification } from '@/utils/sendPushNotification';

export function useMusyawaroh(currentUser: User | null, m5uId: string | null) {
  const [attendees, setAttendees] = useState<M5UAttendee[]>([]);
  const [actionItems, setActionItems] = useState<M5UActionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendees = useCallback(async () => {
    if (!m5uId) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'm5u', m5uId, 'attendees'));
      setAttendees(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as M5UAttendee[]);
    } catch (e) {
      showError('Gagal memuat data absensi.');
    } finally {
      setLoading(false);
    }
  }, [m5uId]);

  const fetchActionItems = useCallback(async () => {
    if (!m5uId) return;
    try {
      const snap = await getDocs(
        query(collection(db, 'm5u', m5uId, 'actionItems'), orderBy('createdAt', 'asc')),
      );
      setActionItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as M5UActionItem[]);
    } catch (e) {
      showError('Gagal memuat action items.');
    }
  }, [m5uId]);

  useEffect(() => {
    if (!m5uId) return;
    fetchAttendees();
    fetchActionItems();
  }, [m5uId, fetchAttendees, fetchActionItems]);

  const upsertAttendee = useCallback(async (
    data: Omit<M5UAttendee, 'id'>,
    existingId?: string,
  ) => {
    if (!m5uId) return;
    try {
      if (existingId) {
        await updateDoc(doc(db, 'm5u', m5uId, 'attendees', existingId), { ...data });
        setAttendees((prev) =>
          prev.map((a) => (a.id === existingId ? { id: existingId, ...data } : a)),
        );
      } else {
        const ref = await addDoc(collection(db, 'm5u', m5uId, 'attendees'), data);
        setAttendees((prev) => [...prev, { id: ref.id, ...data }]);
      }
      showSuccess('Absensi berhasil disimpan.');
    } catch (e) {
      showError('Gagal menyimpan absensi.');
    }
  }, [m5uId]);

  const addActionItem = useCallback(async (data: Omit<M5UActionItem, 'id'>) => {
    if (!m5uId) return;
    try {
      const payload = { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
      const ref = await addDoc(collection(db, 'm5u', m5uId, 'actionItems'), payload);
      setActionItems((prev) => [...prev, { id: ref.id, ...payload }]);
      showSuccess('Action item berhasil ditambahkan.');
      if (data.pj && data.pj !== currentUser?.id) {
        sendPushNotification({
          targetUserId: data.pj,
          type: 'm5u_outstanding',
          title: 'Action Item Baru dari Musyawaroh',
          body: data.deskripsi?.slice(0, 80) ?? 'Anda memiliki tindak lanjut baru.',
          link: 'musyawaroh-detail',
          entityId: ref.id,
          entityType: 'actionItem',
        });
      }
    } catch (e) {
      showError('Gagal menambahkan action item.');
    }
  }, [m5uId, currentUser?.id]);

  const updateActionItem = useCallback(async (itemId: string, data: Partial<M5UActionItem>) => {
    if (!m5uId) return;
    try {
      await updateDoc(doc(db, 'm5u', m5uId, 'actionItems', itemId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      setActionItems((prev) =>
        prev.map((ai) => (ai.id === itemId ? { ...ai, ...data } : ai)),
      );
      showSuccess('Action item berhasil diperbarui.');
    } catch (e) {
      showError('Gagal memperbarui action item.');
    }
  }, [m5uId]);

  const deleteActionItem = useCallback(async (itemId: string) => {
    if (!m5uId) return;
    try {
      await deleteDoc(doc(db, 'm5u', m5uId, 'actionItems', itemId));
      setActionItems((prev) => prev.filter((ai) => ai.id !== itemId));
      showSuccess('Action item berhasil dihapus.');
    } catch (e) {
      showError('Gagal menghapus action item.');
    }
  }, [m5uId]);

  const updateNotulensi = useCallback(async (notulensi: string) => {
    if (!m5uId) return;
    try {
      await updateDoc(doc(db, 'm5u', m5uId), { notulensi, updatedAt: Timestamp.now() });
      showSuccess('Notulensi berhasil disimpan.');
    } catch (e) {
      showError('Gagal menyimpan notulensi.');
    }
  }, [m5uId]);

  return {
    attendees,
    actionItems,
    loading,
    fetchAttendees,
    fetchActionItems,
    upsertAttendee,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    updateNotulensi,
  };
}
