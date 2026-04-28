import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      showError('Email harus diisi.');
      return;
    }

    const toastId = showLoading('Mengirim link reset password...');
    try {
      await sendPasswordResetEmail(auth, email);
      dismissToast(toastId);
      showSuccess(`Link reset password telah dikirim ke: ${email}`);
    } catch (error: unknown) {
      dismissToast(toastId);
      const authError = error as { code?: string };
      if (authError.code === 'auth/invalid-email') {
        showError('Format email tidak valid.');
        return;
      }
      if (authError.code === 'auth/user-not-found') {
        showError('Email tidak terdaftar.');
        return;
      }
      showError('Gagal mengirim link reset password.');
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-muted p-12">
        <img src="/logo.png" alt="Forgot Password Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-primary p-8 text-primary-foreground">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Lupa Password?</h1>
            <p className="mt-2 opacity-80">Jangan khawatir, kami akan mengirimkan instruksi reset.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Anda"
                  className="bg-card text-foreground rounded-full pl-12 py-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button 
              className="w-full bg-card text-primary rounded-full py-6 font-semibold hover:bg-primary/10"
              onClick={handleResetPassword}
            >
              Kirim Link Reset
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm opacity-80 hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}