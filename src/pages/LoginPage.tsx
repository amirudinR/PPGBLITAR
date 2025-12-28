import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { showError, showSuccess } from '@/utils/toast';
import { Mail, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Email dan password harus diisi.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Login berhasil!");
      // Navigasi sekarang ditangani secara otomatis oleh App.tsx
    } catch (error: any) {
      console.error("Error logging in: ", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showError("Email atau password salah.");
      } else {
        showError("Terjadi kesalahan saat mencoba login.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-card/20 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 shadow-lg"
        title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-300" />
        ) : (
          <Moon className="h-5 w-5 text-white" />
        )}
      </button>

      <div className="hidden lg:flex items-center justify-center bg-muted p-12">
        <img src="/logo.png" alt="Login Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-primary p-8 text-primary-foreground">
        <div className="w-full max-w-sm space-y-8">
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
                  type="password"
                  placeholder="Password Anda"
                  className="bg-background text-foreground rounded-full pl-12 py-6 border-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
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
