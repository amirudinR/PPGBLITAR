import React from 'react';
import { M5UAttendee } from '@/types/admin';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { STATUS_HADIR_LABELS } from './constants';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: M5UAttendee;
  form: Omit<M5UAttendee, 'id'>;
  onFormChange: (form: Omit<M5UAttendee, 'id'>) => void;
  onSave: () => void;
}

export default function AttendeeDialog({
  open,
  onOpenChange,
  existing,
  form,
  onFormChange,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit Absensi' : 'Tambah Peserta'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Nama</Label>
            <Input value={form.name} onChange={(e) => onFormChange({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Status Kehadiran</Label>
            <Select value={form.status} onValueChange={(v) => onFormChange({ ...form, status: v as M5UAttendee['status'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_HADIR_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Keterangan</Label>
            <Input value={form.keterangan ?? ''} onChange={(e) => onFormChange({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
