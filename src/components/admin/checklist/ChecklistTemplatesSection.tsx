import React, { useState } from 'react';
import { User } from '@/types/admin';
import { ChecklistTemplate, ChecklistItem, ChecklistFrequency } from '@/types/checklist';
import { useChecklistTemplates } from '@/hooks/useChecklist';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import { Role } from '@/types/admin';

const FREQ_LABELS: Record<ChecklistFrequency, string> = {
  sekali: 'Sekali',
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
  'per-event': 'Per Event M5U',
};

const ROLE_LABELS: Partial<Record<Role, string>> = {
  guru: 'Guru',
  kelompok: 'PJP Kelompok',
  desa: 'PJP Desa',
  admin: 'Admin',
  adminsuper: 'Admin Super',
};

const TARGET_ROLES: Role[] = ['guru', 'kelompok', 'desa', 'admin'];

const EMPTY_TEMPLATE: Omit<ChecklistTemplate, 'id' | 'createdAt'> = {
  nama: '',
  deskripsi: '',
  targetRoles: [],
  frekuensi: 'bulanan',
  items: [],
  createdBy: '',
  isActive: true,
};

interface Props {
  currentUser: User | null;
}

export default function ChecklistTemplatesSection({ currentUser }: Props) {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates(currentUser);
  const [dialog, setDialog] = useState<{ open: boolean; existing?: ChecklistTemplate }>({ open: false });
  const [form, setForm] = useState<Omit<ChecklistTemplate, 'id' | 'createdAt'>>(EMPTY_TEMPLATE);

  const openDialog = (t?: ChecklistTemplate) => {
    if (t) {
      const { id, createdAt, ...rest } = t;
      setForm(rest);
    } else {
      setForm({ ...EMPTY_TEMPLATE, createdBy: currentUser?.id ?? '' });
    }
    setDialog({ open: true, existing: t });
  };

  const handleSave = async () => {
    const payload = { ...form, createdBy: form.createdBy || currentUser?.id || '', createdAt: new Date() } as Omit<ChecklistTemplate, 'id'>;
    let ok: boolean;
    if (dialog.existing) {
      ok = await updateTemplate(dialog.existing.id, form);
    } else {
      ok = await addTemplate(payload);
    }
    if (ok) setDialog({ open: false });
  };

  const addItem = () => {
    const newItem: ChecklistItem = { id: crypto.randomUUID(), label: '', wajib: true, tipe: 'check' };
    setForm((p) => ({ ...p, items: [...p.items, newItem] }));
  };

  const updateItem = (index: number, patch: Partial<ChecklistItem>) => {
    setForm((p) => {
      const items = [...p.items];
      items[index] = { ...items[index], ...patch };
      return { ...p, items };
    });
  };

  const removeItem = (index: number) => {
    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== index) }));
  };

  const toggleRole = (role: Role) => {
    setForm((p) => {
      const roles = p.targetRoles.includes(role)
        ? p.targetRoles.filter((r) => r !== role)
        : [...p.targetRoles, role];
      return { ...p, targetRoles: roles };
    });
  };

  if (loading) return <div className="text-center p-8 text-muted-foreground">Memuat template...</div>;

  return (
    <div>
      <SectionHeader
        title="Template Checklist"
        subtitle="Buat template checklist untuk guru dan PJP yang dapat di-assign secara otomatis."
        action={
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />Tambah Template
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          title="Belum ada template checklist"
          description="Buat template checklist pertama untuk mulai memonitor tugas guru dan PJP."
          action={<Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Tambah Template</Button>}
        />
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Template</TableHead>
                <TableHead>Frekuensi</TableHead>
                <TableHead>Target Peran</TableHead>
                <TableHead>Jumlah Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nama}</TableCell>
                  <TableCell>{FREQ_LABELS[t.frekuensi]}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.targetRoles.map((r) => (
                        <Badge key={r} variant="secondary">{ROLE_LABELS[r] ?? r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{t.items.length} item</TableCell>
                  <TableCell>
                    <Badge variant={t.isActive ? 'default' : 'secondary'}>{t.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                  </TableCell>
                  <TableCell className="text-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(t)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus template "{t.nama}"?</AlertDialogTitle>
                          <AlertDialogDescription>Template yang sudah dihapus tidak dapat dipulihkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTemplate(t.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog.existing ? 'Edit Template' : 'Template Checklist Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <Label>Nama Template</Label>
                <Input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} />
              </div>
              <div className="col-span-full">
                <Label>Deskripsi</Label>
                <Textarea value={form.deskripsi} onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))} />
              </div>
              <div>
                <Label>Frekuensi</Label>
                <Select value={form.frekuensi} onValueChange={(v) => setForm((p) => ({ ...p, frekuensi: v as ChecklistFrequency }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQ_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Status</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(c) => setForm((p) => ({ ...p, isActive: !!c }))}
                  />
                  <Label htmlFor="isActive">Template Aktif</Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Target Peran</Label>
              <div className="flex flex-wrap gap-3">
                {TARGET_ROLES.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${r}`}
                      checked={form.targetRoles.includes(r)}
                      onCheckedChange={() => toggleRole(r)}
                    />
                    <Label htmlFor={`role-${r}`}>{ROLE_LABELS[r] ?? r}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Item Checklist ({form.items.length})</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" />Tambah Item
                </Button>
              </div>
              {form.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada item. Klik "Tambah Item".</p>
              ) : (
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2 rounded border p-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input
                        className="flex-1"
                        placeholder={`Item ${i + 1}`}
                        value={item.label}
                        onChange={(e) => updateItem(i, { label: e.target.value })}
                      />
                      <Select value={item.tipe} onValueChange={(v) => updateItem(i, { tipe: v as ChecklistItem['tipe'] })}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check">Centang</SelectItem>
                          <SelectItem value="text">Teks</SelectItem>
                          <SelectItem value="number">Angka</SelectItem>
                          <SelectItem value="upload">Upload</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={item.wajib}
                          onCheckedChange={(c) => updateItem(i, { wajib: !!c })}
                        />
                        <span className="text-xs text-muted-foreground">Wajib</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Batal</Button>
            <Button onClick={handleSave} disabled={!form.nama}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
