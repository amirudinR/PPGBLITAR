import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // Placeholder for password reset logic
    alert(`Link reset password telah dikirim ke: ${email}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="w-full max-w-md mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Lupa Password Anda?</CardTitle>
            <CardDescription>
              Jangan khawatir. Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleResetPassword}>
              Kirim Link Reset
            </Button>
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Kembali ke Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}