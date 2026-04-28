import React from 'react';
import { Role, User } from '@/types/admin';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ROLE_LABELS } from '@/hooks/useAccounts';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: Omit<User, 'id'>;
  setUser: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>;
  onSave: () => void;
  onRoleChange: (role: Role) => void;
  creatableRoles: () => Role[];
  desas: { id: string; name: string }[];
  kelompok: { id: string; name: string; desaName: string }[];
  currentUser: { role: string; desa?: string } | null;
}

export default function AddUserDialog({
  open, setOpen, user, setUser, onSave,
  onRoleChange, creatableRoles, desas, kelompok, currentUser,
}: Props) {
  if (currentUser?.role === 'kelompok') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          <span>Tambah Akun</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Akun Baru</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Peran</Label>
            <Select value={user.role} onValueChange={(v) => onRoleChange(v as Role)}>
              <SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
              <SelectContent>
                {creatableRoles().map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {['desa', 'kelompok', 'guru', 'orangtua'].includes(user.role) && (
            <div>
              <Label>Desa</Label>
              <Select
                value={user.desa}
                onValueChange={(desa) => setUser((prev) => ({ ...prev, desa, kelompok: '' }))}
                disabled={currentUser?.role === 'desa'}
              >
                <SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger>
                <SelectContent>
                  {desas.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {['kelompok', 'guru', 'orangtua'].includes(user.role) && (
            <div>
              <Label>Kelompok</Label>
              <Select
                value={user.kelompok}
                onValueChange={(kelompok) => setUser((prev) => ({ ...prev, kelompok }))}
              >
                <SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                <SelectContent>
                  {kelompok.filter((k) => k.desaName === user.desa).map((k) => (
                    <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Nama</Label>
            <Input
              placeholder="Nama Lengkap"
              value={user.name}
              onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
