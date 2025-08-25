import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { showError, showSuccess } from '@/utils/toast';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gray-100 p-12">
        <img src="/logo.png" alt="Login Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-indigo-600 p-8 text-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold">Selamat Datang!</h1>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Anda"
                  className="bg-white text-gray-900 rounded-full pl-12 py-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password Anda"
                  className="bg-white text-gray-900 rounded-full pl-12 py-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end pt-2">
                <Button 
                    className="w-auto bg-white text-indigo-600 rounded-full px-8 py-6 font-semibold hover:bg-indigo-50"
                    onClick={handleLogin}
                >
                    Masuk
                </Button>
            </div>
             <div className="text-center space-y-2">
                <Link to="/forgot-password" className="text-sm text-indigo-200 hover:underline">
                  Lupa Password?
                </Link>
                <p className="text-sm text-indigo-200">
                  Belum punya akun?{' '}
                  <Link to="/register" className="font-semibold underline hover:text-white">
                    Daftar di sini
                  </Link>
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}