import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { showError, showSuccess } from '@/utils/toast';
import { User, ROLES, Role } from '@/types/admin';
import { Mail, Lock, User as UserIcon, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ROLE_LABELS: Record<Role, string> = {
  adminsuper: 'Admin Super',
  admin: 'Admin',
  desa: 'PJP Desa',
  kelompok: 'PJP Kelompok',
  guru: 'Guru',
  orangtua: 'Orang Tua'
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('orangtua');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showError("Semua field harus diisi.");
      return;
    }

    try {
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        password,
        role,
        status: 'Active',
      };
      await addDoc(collection(db, "users"), newUser);
      showSuccess("Registrasi berhasil! Silakan login.");
      navigate('/login');
    } catch (error) {
      console.error("Error registering: ", error);
      showError("Terjadi kesalahan saat mencoba registrasi.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gray-100 p-12">
        <img src="/placeholder.svg" alt="Register Illustration" className="w-full max-w-md" />
      </div>
      <div className="flex flex-col items-center justify-center bg-blue-600 p-8 text-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Buat Akun Baru</h1>
            <p className="mt-2 text-blue-200">Bergabunglah dengan kami hari ini!</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  className="bg-white text-gray-900 rounded-full pl-12 py-6"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
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
            <div className="space-y-2">
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger className="bg-white text-gray-900 rounded-full pl-12 py-6">
                    <SelectValue placeholder="Pilih Peran Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guru">{ROLE_LABELS['guru']}</SelectItem>
                    <SelectItem value="orangtua">{ROLE_LABELS['orangtua']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              className="w-full bg-yellow-400 text-blue-900 rounded-full py-6 font-semibold hover:bg-yellow-500"
              onClick={handleRegister}
            >
              Daftar
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-200 hover:underline">
                Sudah punya akun? Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}