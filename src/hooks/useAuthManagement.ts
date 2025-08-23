import { getAuth, updatePassword } from "firebase/auth";
import { showError, showSuccess } from "@/utils/toast";

export function useAuthManagement() {
  const updateCurrentUserPassword = async (newPassword: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await updatePassword(user, newPassword);
        showSuccess("Password berhasil diperbarui.");
        return true;
      } catch (error: any) {
        console.error("Error updating password:", error);
        if (error.code === 'auth/requires-recent-login') {
          showError("Sesi Anda telah berakhir. Silakan logout dan login kembali untuk mengubah password.");
        } else {
          showError("Gagal memperbarui password.");
        }
        return false;
      }
    } else {
      showError("Tidak ada pengguna yang sedang login.");
      return false;
    }
  };

  return { updateCurrentUserPassword };
}