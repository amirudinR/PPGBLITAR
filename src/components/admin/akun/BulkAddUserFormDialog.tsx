import React, { useState } from 'react';
import { Role } from '@/types/admin';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ROLE_LABELS, getCreatableRoles } from '@/utils/roleHelpers';
import { showError } from '@/utils/toast';
import { Plus, Trash2, UserPlus } from 'lucide-react';

interface UserFormEntry {
  name: string;
  email: string;
  password: string;
  role: Role;
  desa: string;
  kelompok: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (users: Omit<any, 'id'>[]) => Promise<boolean>;
  desas: { id: string; name: string }[];
  kelompok: { id: string; name: string; desaName: string }[];
  currentUser: { role: string; desa?: string; kelompok?: string } | null;
}

const emptyEntry = (currentUser: { role: string; desa?: string; kelompok?: string } | null): UserFormEntry => ({
  name: '',
  email: '',
  password: '',
  role: 'guru',
  desa: currentUser?.role === 'desa' || currentUser?.role === 'kelompok' ? currentUser.desa || '' : '',
  kelompok: currentUser?.role === 'kelompok' ? currentUser.kelompok || '' : '',
});

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function BulkAddUserFormDialog({
  open, setOpen, onSave, desas, kelompok, currentUser,
}: Props) {
  const [entries, setEntries] = useState<UserFormEntry[]>([emptyEntry(currentUser)]);

  const creatableRoles = getCreatableRoles(currentUser?.role || null);

  const updateEntry = (index: number, field: keyof UserFormEntry, value: string) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'role' && !['desa', 'kelompok', 'guru', 'orangtua'].includes(value)) {
        next[index].desa = '';
        next[index].kelompok = '';
      }
      if (field === 'role' && currentUser?.role === 'desa') {
        next[index].desa = currentUser.desa || '';
      }
      if (field === 'role' && currentUser?.role === 'kelompok') {
        next[index].desa = currentUser.desa || '';
        next[index].kelompok = currentUser.kelompok || '';
      }
      if (field === 'desa') {
        next[index].kelompok = '';
      }
      return next;
    });
  };

  const addEntry = () => {
    setEntries((prev) => {
      const last = prev[prev.length - 1];
      const copy: UserFormEntry = {
        name: '',
        email: '',
        password: '',
        role: last.role,
        desa: last.desa,
        kelompok: last.kelompok,
      };
      return [...prev, copy];
    });
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const errors: string[] = [];

    entries.forEach((e, i) => {
      const row = i + 1;
      if (!e.name.trim()) errors.push(`Baris ${row}: Nama harus diisi.`);
      if (!e.email.trim()) errors.push(`Baris ${row}: Email harus diisi.`);
      else if (!isValidEmail(e.email.trim())) errors.push(`Baris ${row}: Format email tidak valid.`);
      if (!e.password) errors.push(`Baris ${row}: Password harus diisi.`);
      else if (e.password.length < 6) errors.push(`Baris ${row}: Password minimal 6 karakter.`);
    });

    if (errors.length > 0) {
      showError(errors.join('\n'));
      return;
    }

    const data = entries.map((e) => ({
      name: e.name.trim(),
      email: e.email.trim(),
      password: e.password,
      role: e.role,
      status: 'Active' as const,
      desa: e.desa,
      kelompok: e.kelompok,
    }));

    const ok = await onSave(data);
    if (ok) {
      setOpen(false);
      setEntries([emptyEntry(currentUser)]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEntries([emptyEntry(currentUser)]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Banyak Akun</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="p-4 border rounded-lg relative">
              {entries.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntry(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="text-xs text-muted-foreground mb-3 font-medium">
                Akun #{index + 1}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Peran</Label>
                  <Select value={entry.role} onValueChange={(v) => updateEntry(index, 'role', v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {creatableRoles.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {['desa', 'kelompok', 'guru', 'orangtua'].includes(entry.role) && (
                  <div>
                    <Label>Desa</Label>
                    <Select
                      value={entry.desa}
                      onValueChange={(v) => updateEntry(index, 'desa', v)}
                      disabled={currentUser?.role === 'desa' || currentUser?.role === 'kelompok'}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {desas.map((d) => (
                          <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {['kelompok', 'guru', 'orangtua'].includes(entry.role) && (
                  <div>
                    <Label>Kelompok</Label>
                    <Select
                      value={entry.kelompok}
                      onValueChange={(v) => updateEntry(index, 'kelompok', v)}
                      disabled={currentUser?.role === 'kelompok'}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        {kelompok.filter((k) => k.desaName === entry.desa).map((k) => (
                          <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <Label>Nama</Label>
                  <Input
                    placeholder="Nama Lengkap"
                    value={entry.name}
                    onChange={(e) => updateEntry(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={entry.email}
                    onChange={(e) => updateEntry(index, 'email', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={entry.password}
                    onChange={(e) => updateEntry(index, 'password', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Baris
          </Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Batal</Button>
          <Button onClick={handleSubmit}>
            <UserPlus className="w-4 h-4 mr-2" />
            Simpan ({entries.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
