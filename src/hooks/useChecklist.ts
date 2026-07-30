import { useState, useCallback } from 'react';
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChecklistTemplate, ChecklistAssignment } from '@/types/checklist';
import { User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';
import { sendPushNotification } from '@/utils/sendPushNotification';

export function useChecklistTemplates(currentUser: User | null) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'checklistTemplates'), orderBy('createdAt', 'desc')));
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ChecklistTemplate[]);
    } catch (e) {
      showError('Gagal memuat template checklist.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTemplate = useCallback(async (data: Omit<ChecklistTemplate, 'id'>) => {
    try {
      const payload = { ...data, createdAt: Timestamp.now() };
      const ref = await addDoc(collection(db, 'checklistTemplates'), payload);
      setTemplates((prev) => [{ id: ref.id, ...payload }, ...prev]);
      showSuccess('Template checklist berhasil ditambahkan.');
      return true;
    } catch (e) {
      showError('Gagal menambahkan template.');
      return false;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, data: Partial<ChecklistTemplate>) => {
    try {
      await updateDoc(doc(db, 'checklistTemplates', id), data);
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      showSuccess('Template berhasil diperbarui.');
      return true;
    } catch (e) {
      showError('Gagal memperbarui template.');
      return false;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'checklistTemplates', id));
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showSuccess('Template berhasil dihapus.');
    } catch (e) {
      showError('Gagal menghapus template.');
    }
  }, []);

  return { templates, loading, fetchTemplates, addTemplate, updateTemplate, deleteTemplate };
}

export function useChecklistAssignments(currentUser: User | null) {
  const [assignments, setAssignments] = useState<ChecklistAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    setLoading(true);
    try {
      let q = query(collection(db, 'checklistAssignments'), orderBy('dueDate', 'asc'));

      if (currentUser.role === 'guru' || currentUser.role === 'kelompok') {
        q = query(
          collection(db, 'checklistAssignments'),
          where('assigneeId', '==', currentUser.id),
          orderBy('dueDate', 'asc'),
        );
      } else if (currentUser.role === 'desa') {
        q = query(
          collection(db, 'checklistAssignments'),
          where('desa', '==', currentUser.desa),
          orderBy('dueDate', 'asc'),
        );
      }

      const snap = await getDocs(q);
      setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ChecklistAssignment[]);
    } catch (e) {
      showError('Gagal memuat checklist.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateAssignment = useCallback(async (id: string, data: Partial<ChecklistAssignment>) => {
    try {
      await updateDoc(doc(db, 'checklistAssignments', id), data);
      setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      showSuccess('Checklist berhasil disimpan.');
      return true;
    } catch (e) {
      showError('Gagal menyimpan checklist.');
      return false;
    }
  }, []);

  const createAssignment = useCallback(async (data: Omit<ChecklistAssignment, 'id'>) => {
    try {
      const ref = await addDoc(collection(db, 'checklistAssignments'), data);
      setAssignments((prev) => [...prev, { id: ref.id, ...data }]);
      showSuccess('Assignment berhasil dibuat.');
      if (data.assigneeId) {
        sendPushNotification({
          targetUserId: data.assigneeId,
          type: 'checklist_assigned',
          title: 'Checklist Baru Ditugaskan',
          body: `Anda memiliki checklist baru: ${data.templateNama}`,
          link: 'checklist-saya',
          entityId: ref.id,
          entityType: 'checklist',
        });
      }
      return true;
    } catch (e) {
      showError('Gagal membuat assignment.');
      return false;
    }
  }, []);

  return { assignments, loading, fetchAssignments, updateAssignment, createAssignment };
}
