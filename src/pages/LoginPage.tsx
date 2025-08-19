import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { showError, showSuccess } from '@/utils/toast';
import { User } from '@/types/admin';

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="w-full max-w-md mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Selamat Datang Kembali!</CardTitle>
            <CardDescription>Silakan masuk untuk mengakses dashboard Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLogin}>
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}