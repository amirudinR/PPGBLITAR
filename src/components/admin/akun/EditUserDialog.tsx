import React from 'react';
import { User, Role } from '@/types/admin';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ROLE_LABELS } from '@/utils/roleHelpers';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onSave: () => void;
  creatableRoles: Role[];
  canResetPassword: (target: User) => boolean;
  onResetPassword: (email: string) => void;
}

export default function EditUserDialog({
  open, setOpen, user, setUser, onSave,
  creatableRoles, canResetPassword, onResetPassword,
}: Props) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Akun</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Peran</Label>
            <Select
              value={user.role}
              onValueChange={(v) => setUser((prev) => prev && { ...prev, role: v as Role })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {creatableRoles.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nama</Label>
            <Input
              value={user.name}
              onChange={(e) => setUser((prev) => prev && { ...prev, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email}
              onChange={(e) => setUser((prev) => prev && { ...prev, email: e.target.value })}
            />
          </div>
          {canResetPassword(user) && (
            <div className="space-y-1">
              <Label>Password</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => onResetPassword(user.email)}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Kirim Email Reset Password
              </Button>
              <p className="text-xs text-muted-foreground">Tautan reset akan dikirim ke email pengguna.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
