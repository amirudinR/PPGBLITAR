import { writeBatch, collection, doc, DocumentReference, Firestore } from 'firebase/firestore';
import { showSuccess, showLoading, dismissToast } from '@/utils/toast';

interface BatchOperation<T> {
  data: T[];
  collectionName: string;
  db: Firestore;
  successMessage?: string;
  loadingMessage?: string;
}

export function useBatchOperations<T extends Record<string, any>>() {
  const batchImport = async ({ data, collectionName, db, successMessage, loadingMessage }: BatchOperation<T>) => {
    if (data.length === 0) {
      throw new Error("Tidak ada data untuk diimpor.");
    }

    const toastId = showLoading(loadingMessage || `Mengimpor ${data.length} data...`);
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, collectionName);

      data.forEach(item => {
        const docRef = doc(collectionRef);
        batch.set(docRef, item);
      });

      await batch.commit();
      dismissToast(toastId);
      showSuccess(successMessage || `${data.length} data berhasil diimpor.`);
      return true;
    } catch (error) {
      console.error("Error in batch operation: ", error);
      dismissToast(toastId);
      throw error;
    }
  };

  const batchAddWithCustomRefs = async (
    db: Firestore,
    collectionName: string,
    items: T[],
    getDocRef: (item: T) => DocumentReference,
    successMessage: string
  ) => {
    if (items.length === 0) {
      throw new Error("Tidak ada data untuk ditambahkan.");
    }

    const toastId = showLoading(`Menambahkan ${items.length} data...`);
    try {
      const batch = writeBatch(db);

      items.forEach(item => {
        const docRef = getDocRef(item);
        batch.set(docRef, item);
      });

      await batch.commit();
      dismissToast(toastId);
      showSuccess(successMessage);
      return true;
    } catch (error) {
      console.error("Error in batch add operation: ", error);
      dismissToast(toastId);
      throw error;
    }
  };

  return {
    batchImport,
    batchAddWithCustomRefs,
  };
}
