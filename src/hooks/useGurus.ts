import { useState, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { db } from '@/lib/firebase';
import { Guru, User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

const firebaseConfig = {
  apiKey: "AIzaSyD3E-CRhF973pIiJ3dIx7RFBeGHRHET67I",
  authDomain: "ppg-samarinda.firebaseapp.com",
  projectId: "ppg-samarinda",
  storageBucket: "ppg-samarinda.appspot.com",
  messagingSenderId: "935384769767",
  appId: "1:935384769767:web:056c746c3dc19223742e42"
};

export function useGurus(currentUser: User | null, callbacks?: { onDataChange?: () => void }) {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGurus = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let gurusQuery = query(collection(db, "gurus"));
      if (currentUser.role === 'desa') {
        gurusQuery = query(gurusQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        gurusQuery = query(gurusQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      } else if (currentUser.role === 'guru') {
        gurusQuery = query(gurusQuery, where("userId", "==", currentUser.id));
      }
      const gurusSnap = await getDocs(gurusQuery);
      const gurusData = gurusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guru[];
      setGurus(gurusData);
    } catch (error) {
      console.error("Error fetching gurus: ", error);
      showError("Gagal memuat data guru.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addGuru = async (guruData: Omit<Guru, 'id' | 'userId'>) => {
    if (!guruData.name || !guruData.email || !guruData.password) {
      showError("Nama, Email, dan Password harus diisi.");
      return false;
    }
    const toastId = showLoading("Membuat akun guru...");
    try {
      // Create user in Auth
      const secondaryAppName = 'secondaryAuthApp';
      const appExists = getApps().some(app => app.name === secondaryAppName);
      const secondaryApp = appExists ? getApp(secondaryAppName) : initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, guruData.email, guruData.password);
      const userId = userCredential.user.uid;

      // Create user document in 'users' collection
      const userDoc: Omit<User, 'id' | 'password'> = {
        name: guruData.name,
        email: guruData.email,
        role: 'guru',
        status: 'Active',
        desa: guruData.desa,
        kelompok: guruData.kelompok,
      };
      await setDoc(doc(db, "users", userId), userDoc);

      // Create guru document in 'gurus' collection
      const { password, ...guruDocData } = guruData;
      await addDoc(collection(db, "gurus"), { ...guruDocData, userId });

      dismissToast(toastId);
      showSuccess("Akun guru berhasil dibuat.");
      fetchGurus();
      callbacks?.onDataChange?.();
      return true;
    } catch (error: any) {
      dismissToast(toastId);
      if (error.code === 'auth/email-already-in-use') showError("Email ini sudah terdaftar.");
      else showError("Gagal menambahkan akun guru.");
      console.error(error);
      return false;
    }
  };

  const updateGuru = async (id: string, guruData: Omit<Guru, 'id' | 'password'>) => {
    try {
      // Update guru document
      await updateDoc(doc(db, "gurus", id), guruData);

      // Update corresponding user document
      const userDocRef = doc(db, "users", guruData.userId);
      await updateDoc(userDocRef, {
        name: guruData.name,
        email: guruData.email,
        desa: guruData.desa,
        kelompok: guruData.kelompok,
      });

      fetchGurus();
      callbacks?.onDataChange?.();
      showSuccess("Data guru berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui data guru.");
      return false;
    }
  };

  const deleteGuru = async (guru: Guru) => {
    try {
      // Note: Deleting the user from Firebase Auth is a privileged operation
      // and should ideally be handled by a Cloud Function.
      // Here, we only delete from Firestore collections.
      await deleteDoc(doc(db, "gurus", guru.id));
      await deleteDoc(doc(db, "users", guru.userId));
      
      fetchGurus();
      callbacks?.onDataChange?.();
      showSuccess("Data guru berhasil dihapus.");
    } catch (e) {
      showError("Gagal menghapus data guru.");
    }
  };

  return { gurus, loading, fetchGurus, addGuru, updateGuru, deleteGuru };
}