import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { showError, showSuccess } from '@/utils/toast';
import { Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedEmail && savedRememberMe === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Email dan password harus diisi.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Login berhasil!");

      // Save email to localStorage if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      // Navigasi sekarang ditangani secara otomatis oleh App.tsx
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Error logging in: ", firebaseError);
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        showError("Email atau password salah.");
      } else {
        showError("Terjadi kesalahan saat mencoba login.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative bg-background overflow-hidden">
      {/* Floating Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-5 right-5 z-50 p-3 rounded-full bg-card/40 backdrop-blur-md hover:bg-card/70 border border-border/50 text-foreground transition-all duration-300 shadow-md hover:scale-105"
        title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-amber-400 animate-pulse" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </button>

      {/* Left Branding Showcase Panel (Desktop) */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-[hsl(218,78%,24%)] via-[hsl(218,75%,20%)] to-[hsl(220,80%,14%)] text-white">
        {/* Background Decorative Glow Blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-6">
          {/* Logo Card with Glassmorphism */}
          <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:scale-102 transition-transform duration-300">
            <img
              src="https://res.cloudinary.com/dqetur2r1/image/upload/v1785414670/WhatsApp_Image_2026-07-30_at_19.27.32_ypyas6.jpg"
              alt="PPG BLITAR Logo"
              className="w-full max-w-xs h-auto drop-shadow-2xl rounded-2xl mx-auto"
            />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-sm">
              ✨ Penggerak Pembina Generus
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              PPG BLITAR
            </h1>
            <p className="text-amber-300 text-sm font-semibold tracking-wider uppercase">
              Be The Teacher of The World
            </p>
            <p className="text-slate-300 text-xs max-w-sm mx-auto leading-relaxed">
              Sistem Manajemen Data Pendidikan Generasi Penerus Terintegrasi & Akuntabel
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative bg-card text-card-foreground">
        <div className="w-full max-w-md space-y-8 p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-xl lg:shadow-none lg:border-none">
          {/* Mobile Logo Branding */}
          <div className="flex flex-col items-center gap-3 lg:hidden text-center">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <img
                src="https://res.cloudinary.com/dqetur2r1/image/upload/v1785414670/WhatsApp_Image_2026-07-30_at_19.27.32_ypyas6.jpg"
                alt="PPG BLITAR Logo"
                className="w-24 h-auto drop-shadow-md rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">PPG BLITAR</h2>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Be The Teacher of The World</p>
            </div>
          </div>

          <div className="text-left space-y-1">
            <h2 className="text-3xl font-bold text-foreground">Selamat Datang! 👋</h2>
            <p className="text-sm text-muted-foreground">Silakan masuk ke akun pengurus Anda</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-foreground tracking-wide">
                Email / ID Pengurus
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground tracking-wide">
                  Kata Sandi
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-muted/40 text-foreground rounded-xl pl-12 pr-12 py-5 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                  title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-md border-border"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                >
                  Ingat saya di perangkat ini
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all text-sm gap-2"
            >
              Masuk ke Panel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
