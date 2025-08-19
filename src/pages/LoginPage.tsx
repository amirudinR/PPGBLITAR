import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { showError, showSuccess } from '@/utils/toast';
import { User } from '@/types/admin';
import { Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  setCurrentUser: (user: User) => void;
}

export default function LoginPage({ setCurrentUser }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      showError("Email dan password harus diisi.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email), where("password", "==", password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showError("Email atau password salah.");
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        
        setCurrentUser(userData);
        showSuccess(`Selamat datang, ${userData.name}!`);
        navigate('/admin');
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      showError("Terjadi kesalahan saat mencoba login.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gray-100 p-12">
        <img src="/placeholder.svg" alt="Login Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-blue-600 p-8 text-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Welcome!</h1>
            <p className="mt-2 text-blue-200">Sign in to continue to your dashboard.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Your e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="youremail@example.com"
                  className="bg-white text-gray-900 rounded-full pl-12 py-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-blue-200 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white text-gray-900 rounded-full pl-12 py-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button 
              className="w-full bg-white text-blue-600 rounded-full py-6 font-semibold hover:bg-blue-100"
              onClick={handleLogin}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}