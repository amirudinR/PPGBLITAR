import { useState, useCallback } from 'react';
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EvaluasiSemester, EvaluasiPeriode } from '@/types/evaluasi';
import { User } from '@/types/admin';
import { showError, showSuccess } from '@/utils/toast';

export function useEvaluasiPeriode() {
  const [periodes, setPeriodes] = useState<EvaluasiPeriode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPeriodes = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'evaluasiPeriode'), orderBy('startDate', 'desc')));
      setPeriodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EvaluasiPeriode[]);
    } catch (e) {
      showError('Gagal memuat periode evaluasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPeriode = useCallback(async (data: Omit<EvaluasiPeriode, 'id'>) => {
    try {
      const ref = await addDoc(collection(db, 'evaluasiPeriode'), data);
      setPeriodes((prev) => [{ id: ref.id, ...data }, ...prev]);
      showSuccess('Periode evaluasi berhasil dibuat.');
      return true;
    } catch (e) {
      showError('Gagal membuat periode evaluasi.');
      return false;
    }
  }, []);

  const updatePeriode = useCallback(async (id: string, data: Partial<EvaluasiPeriode>) => {
    try {
      await updateDoc(doc(db, 'evaluasiPeriode', id), data);
      setPeriodes((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      showSuccess('Periode berhasil diperbarui.');
      return true;
    } catch (e) {
      showError('Gagal memperbarui periode.');
      return false;
    }
  }, []);

  const deletePeriode = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'evaluasiPeriode', id));
      setPeriodes((prev) => prev.filter((p) => p.id !== id));
      showSuccess('Periode berhasil dihapus.');
    } catch (e) {
      showError('Gagal menghapus periode.');
    }
  }, []);

  const activePeriode = periodes.find((p) => p.isOpen) ?? null;

  return { periodes, activePeriode, loading, fetchPeriodes, addPeriode, updatePeriode, deletePeriode };
}

export function useEvaluasiSemester(currentUser: User | null) {
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiSemester[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvaluasi = useCallback(async () => {
    if (!currentUser) { setLoading(false); return; }
    setLoading(true);
    try {
      let q = query(collection(db, 'evaluasiSemester'), orderBy('filledAt', 'desc'));

      if (currentUser.role === 'guru') {
        q = query(collection(db, 'evaluasiSemester'), where('filledBy', '==', currentUser.id));
      } else if (currentUser.role === 'kelompok') {
        q = query(collection(db, 'evaluasiSemester'), where('kelompok', '==', currentUser.kelompok), where('desa', '==', currentUser.desa));
      } else if (currentUser.role === 'desa') {
        q = query(collection(db, 'evaluasiSemester'), where('desa', '==', currentUser.desa));
      } else if (currentUser.role === 'orangtua') {
        q = query(collection(db, 'evaluasiSemester'), where('desa', '==', currentUser.desa), where('status', '==', 'published'));
      }

      const snap = await getDocs(q);
      setEvaluasiList(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as EvaluasiSemester[]);
    } catch (e) {
      showError('Gagal memuat data evaluasi.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const saveEvaluasi = useCallback(async (id: string | null, data: Partial<EvaluasiSemester>) => {
    try {
      if (id) {
        await updateDoc(doc(db, 'evaluasiSemester', id), { ...data, filledAt: Timestamp.now() });
        setEvaluasiList((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      } else {
        const payload = { ...data, filledAt: Timestamp.now() };
        const ref = await addDoc(collection(db, 'evaluasiSemester'), payload);
        setEvaluasiList((prev) => [...prev, { id: ref.id, ...payload } as EvaluasiSemester]);
      }
      showSuccess('Evaluasi berhasil disimpan.');
      return true;
    } catch (e) {
      showError('Gagal menyimpan evaluasi.');
      return false;
    }
  }, []);

  const publishEvaluasi = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'evaluasiSemester', id), {
        status: 'published',
        publishedAt: Timestamp.now(),
      });
      setEvaluasiList((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'published' as const } : e)),
      );
      showSuccess('Evaluasi berhasil dipublikasikan.');
      return true;
    } catch (e) {
      showError('Gagal mempublikasikan evaluasi.');
      return false;
    }
  }, []);

  return { evaluasiList, loading, fetchEvaluasi, saveEvaluasi, publishEvaluasi };
}
