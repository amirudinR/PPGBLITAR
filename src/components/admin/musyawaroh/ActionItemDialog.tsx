import React from 'react';
import { M5UActionItem } from '@/types/admin';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ACTION_STATUS_CONFIG } from './constants';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: M5UActionItem;
  form: Omit<M5UActionItem, 'id'>;
  onFormChange: (form: Omit<M5UActionItem, 'id'>) => void;
  onSave: () => void;
}

export default function ActionItemDialog({
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
          <DialogTitle>{existing ? 'Edit Action Item' : 'Tambah Action Item'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Deskripsi Tindak Lanjut</Label>
            <Textarea value={form.deskripsi} onChange={(e) => onFormChange({ ...form, deskripsi: e.target.value })} />
          </div>
          <div>
            <Label>Nama PJ (Penanggung Jawab)</Label>
            <Input value={form.pjName} onChange={(e) => onFormChange({ ...form, pjName: e.target.value })} />
          </div>
          <div>
            <Label>Deadline</Label>
            <Input type="date" value={typeof form.dueDate === 'string' ? form.dueDate : ''} onChange={(e) => onFormChange({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => onFormChange({ ...form, status: v as M5UActionItem['status'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ACTION_STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Catatan</Label>
            <Textarea value={form.catatan ?? ''} onChange={(e) => onFormChange({ ...form, catatan: e.target.value })} />
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
