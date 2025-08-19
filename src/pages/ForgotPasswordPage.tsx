import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // Placeholder for password reset logic
    alert(`Link reset password telah dikirim ke: ${email}`);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gray-100 p-12">
        <img src="/placeholder.svg" alt="Forgot Password Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-blue-600 p-8 text-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Forgot Password?</h1>
            <p className="mt-2 text-blue-200">No worries, we'll send you reset instructions.</p>
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
            <Button 
              className="w-full bg-yellow-400 text-blue-900 rounded-full py-6 font-semibold hover:bg-yellow-500"
              onClick={handleResetPassword}
            >
              Send Reset Link
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-200 hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}