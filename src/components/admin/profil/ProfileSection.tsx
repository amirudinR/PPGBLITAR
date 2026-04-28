import React, { useState } from 'react';
import { User } from '@/types/admin';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError } from '@/utils/toast';
import { Theme, useTheme } from '@/hooks/useTheme';

interface ProfileSectionProps {
  currentUser: User | null;
  onUpdatePassword: (newPassword: string) => Promise<boolean>;
}

export default function ProfileSection({ currentUser, onUpdatePassword }: ProfileSectionProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { theme, setTheme } = useTheme();

  const handleUpdate = async () => {
    if (!newPassword) {
      showError("Password baru tidak boleh kosong.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    
    const success = await onUpdatePassword(newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!currentUser) {
    return <div>Memuat data pengguna...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Profil Saya</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Detail akun Anda. Informasi ini tidak dapat diubah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={currentUser.name} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={currentUser.email} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Peran</Label>
              <Input value={currentUser.role} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Tema Aplikasi</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Terang</SelectItem>
                  <SelectItem value="dark">Gelap</SelectItem>
                  <SelectItem value="soft">Soft Minimal Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>Masukkan password baru Anda di bawah ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdate}>Simpan Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}