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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Showcase Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-[hsl(218,78%,24%)] via-[hsl(218,75%,20%)] to-[hsl(220,80%,14%)] text-white">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-6">
          <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <img
              src="https://res.cloudinary.com/dqetur2r1/image/upload/v1785414670/WhatsApp_Image_2026-07-30_at_19.27.32_ypyas6.jpg"
              alt="PPG BLITAR Logo"
              className="w-full max-w-xs h-auto drop-shadow-2xl rounded-2xl mx-auto"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">PPG BLITAR</h1>
            <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Reset Kata Sandi Pengurus</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative bg-card text-card-foreground">
        <div className="w-full max-w-md space-y-8 p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-xl lg:shadow-none lg:border-none">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Lupa Password? 🔑</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan email Anda yang terdaftar untuk menerima link instruksi reset password.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-foreground tracking-wide">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="bg-muted/40 text-foreground rounded-xl pl-12 pr-4 py-5 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all text-sm"
            >
              Kirim Link Reset
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}