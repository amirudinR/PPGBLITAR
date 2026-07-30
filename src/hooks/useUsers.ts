import { useState, useCallback } from 'react';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { db } from '@/lib/firebase';
import { User } from '@/types/admin';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

const firebaseConfig = {
  apiKey: "AIzaSyD3E-CRhF973pIiJ3dIx7RFBeGHRHET67I",
  authDomain: "ppg-samarinda.firebaseapp.com",
  projectId: "ppg-samarinda",
  storageBucket: "ppg-samarinda.appspot.com",
  messagingSenderId: "935384769767",
  appId: "1:935384769767:web:056c746c3dc19223742e42"
};

export function useUsers(currentUser: User | null) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let usersQuery = query(collection(db, "users"));
      if (currentUser.role === 'desa') {
        usersQuery = query(usersQuery, where("desa", "==", currentUser.desa));
      } else if (currentUser.role === 'kelompok') {
        usersQuery = query(usersQuery, where("desa", "==", currentUser.desa), where("kelompok", "==", currentUser.kelompok));
      }
      const usersSnap = await getDocs(usersQuery);
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users: ", error);
      showError("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addUser = async (user: Omit<User, 'id'>) => {
    if (!user.name || !user.email || !user.password) {
      showError("Nama, email, dan password harus diisi.");
      return false;
    }
    const toastId = showLoading("Membuat akun baru...");
    try {
      const secondaryAppName = 'secondaryAuthApp';
      const appExists = getApps().some(app => app.name === secondaryAppName);
      const secondaryApp = appExists ? getApp(secondaryAppName) : initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, user.email, user.password);
      const { password, ...userDataForFirestore } = user;
      await setDoc(doc(db, "users", userCredential.user.uid), userDataForFirestore);
      dismissToast(toastId);
      showSuccess("Akun berhasil ditambahkan.");
      fetchUsers();
      return true;
    } catch (error: any) {
      dismissToast(toastId);
      if (error.code === 'auth/email-already-in-use') showError("Email ini sudah terdaftar.");
      else showError("Gagal menambahkan akun.");
      return false;
    }
  };

  const addUsersBatch = async (users: Omit<User, 'id'>[]) => {
    if (users.length === 0) {
      showError("Tidak ada data untuk diimpor.");
      return false;
    }
    const toastId = showLoading(`Membuat ${users.length} akun...`);
    try {
      const secondaryAppName = 'secondaryAuthApp';
      const appExists = getApps().some(app => app.name === secondaryAppName);
      const secondaryApp = appExists ? getApp(secondaryAppName) : initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const firestoreBatch = writeBatch(db);
      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, user.email, user.password);
          const { password, ...userDataForFirestore } = user;
          const docRef = doc(db, "users", userCredential.user.uid);
          firestoreBatch.set(docRef, userDataForFirestore);
          successCount++;
        } catch (err: any) {
          const rowNum = i + 2;
          if (err.code === 'auth/email-already-in-use') {
            errors.push(`Baris ${rowNum}: Email "${user.email}" sudah terdaftar.`);
          } else {
            errors.push(`Baris ${rowNum}: Gagal membuat akun "${user.email}".`);
          }
        }
      }

      if (successCount > 0) {
        await firestoreBatch.commit();
      }

      dismissToast(toastId);

      if (errors.length > 0) {
        showError(`${successCount} akun berhasil, ${errors.length} gagal:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...dan ${errors.length - 3} error lainnya.` : ''}`);
      } else {
        showSuccess(`${successCount} akun berhasil ditambahkan.`);
      }

      fetchUsers();
      return successCount > 0;
    } catch (error) {
      dismissToast(toastId);
      showError("Gagal memproses import akun.");
      return false;
    }
  };

  const updateUser = async (id: string, updatedData: Omit<User, 'id'>) => {
    try {
      const { password, ...safeData } = updatedData;

      if (password) {
        showError("Perubahan password dilakukan dari menu profil pengguna.");
      }

      await updateDoc(doc(db, "users", id), safeData);
      fetchUsers();
      showSuccess("Akun berhasil diperbarui.");
      return true;
    } catch (e) {
      showError("Gagal memperbarui akun.");
      return false;
    }
  };

  const resetUserPassword = async (email: string) => {
    const toastId = showLoading('Mengirim email reset password...');
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      dismissToast(toastId);
      showSuccess(`Email reset password dikirim ke ${email}.`);
    } catch (e: any) {
      dismissToast(toastId);
      if (e.code === 'auth/user-not-found') showError('Email tidak ditemukan di sistem.');
      else showError('Gagal mengirim email reset password.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
      showSuccess("Akun berhasil dihapus.");
    } catch (e) { showError("Gagal menghapus akun."); }
  };

  return { users, loading, fetchUsers, addUser, addUsersBatch, updateUser, resetUserPassword, deleteUser };
}