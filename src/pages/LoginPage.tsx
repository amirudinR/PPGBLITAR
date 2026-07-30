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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative">
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-card/20 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 shadow-lg"
        title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-yellow-300" />
        ) : (
          <Moon className="h-5 w-5 text-white" />
        )}
      </button>

      <div className={`hidden lg:flex flex-col items-center justify-center p-12 gap-8 ${isDarkMode ? 'bg-background' : 'bg-muted'}`}>
        <img src="https://res.cloudinary.com/dqetur2r1/image/upload/v1785414670/WhatsApp_Image_2026-07-30_at_19.27.32_ypyas6.jpg" alt="PPG BLITAR Logo" className="w-full max-w-md drop-shadow-xl rounded-2xl" />
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">PPG BLITAR</h2>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-wider">Be The Teacher of The World</p>
          <p className="text-muted-foreground text-xs">Penggerak Pembina Generus</p>
        </div>
      </div>
      <div className={`flex flex-col items-center justify-center p-8 ${isDarkMode ? 'bg-background text-foreground' : 'bg-primary text-primary-foreground'}`}>
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo - visible only on small screens */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <img src="https://res.cloudinary.com/dqetur2r1/image/upload/v1785414670/WhatsApp_Image_2026-07-30_at_19.27.32_ypyas6.jpg" alt="PPG BLITAR Logo" className="w-32 h-auto drop-shadow-lg rounded-xl" />
            <div className="text-center space-y-0.5">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-foreground' : 'text-primary-foreground'}`}>PPG BLITAR</h2>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-amber-500' : 'text-amber-300'}`}>Be The Teacher of The World</p>
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold">Selamat Datang!</h1>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Anda"
                  className="bg-background text-foreground rounded-full pl-12 py-6 border-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Anda"
                  className="bg-background text-foreground rounded-full pl-12 pr-12 py-6 border-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="rounded"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Ingat Saya
              </label>
            </div>
            <div className="flex items-center justify-end pt-2">
              <Button
                className="w-auto bg-background text-primary rounded-full px-8 py-6 font-semibold hover:bg-accent"
                onClick={handleLogin}
              >
                Masuk
              </Button>
            </div>
            <div className="text-center space-y-2">
              <Link to="/forgot-password" className="text-sm opacity-80 hover:opacity-100 hover:underline">
                Lupa Password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
