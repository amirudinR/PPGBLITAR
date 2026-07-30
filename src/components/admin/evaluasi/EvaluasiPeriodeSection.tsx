import React, { useState } from 'react';
import { User } from '@/types/admin';
import { EvaluasiPeriode, SemesterType } from '@/types/evaluasi';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => `${CURRENT_YEAR - 1 + i}/${CURRENT_YEAR + i}`);

const EMPTY_FORM: Omit<EvaluasiPeriode, 'id'> = {
  semester: 'ganjil',
  tahunAjaran: `${CURRENT_YEAR}/${CURRENT_YEAR + 1}`,
  startDate: null,
  endDate: null,
  isOpen: false,
};

interface Props {
  currentUser: User | null;
  periodes: EvaluasiPeriode[];
  activePeriode: EvaluasiPeriode | null;
  loading: boolean;
  onAdd: (data: Omit<EvaluasiPeriode, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, data: Partial<EvaluasiPeriode>) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

export default function EvaluasiPeriodeSection({ currentUser, periodes, loading, onAdd, onUpdate, onDelete }: Props) {
  const [dialog, setDialog] = useState<{ open: boolean; existing?: EvaluasiPeriode }>({ open: false });
  const [form, setForm] = useState<Omit<EvaluasiPeriode, 'id'>>(EMPTY_FORM);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  const openDialog = (p?: EvaluasiPeriode) => {
    if (p) {
      const { id, ...rest } = p;
      setForm(rest);
      setStartDateStr(p.startDate?.toDate ? format(p.startDate.toDate(), 'yyyy-MM-dd') : '');
      setEndDateStr(p.endDate?.toDate ? format(p.endDate.toDate(), 'yyyy-MM-dd') : '');
    } else {
      setForm(EMPTY_FORM);
      setStartDateStr('');
      setEndDateStr('');
    }
    setDialog({ open: true, existing: p });
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      startDate: startDateStr ? Timestamp.fromDate(new Date(startDateStr)) : null,
      endDate: endDateStr ? Timestamp.fromDate(new Date(endDateStr)) : null,
    };
    const ok = dialog.existing
      ? await onUpdate(dialog.existing.id, payload)
      : await onAdd(payload);
    if (ok) setDialog({ open: false });
  };

  const toggleOpen = async (p: EvaluasiPeriode) => {
    const opening = !p.isOpen;
    if (opening) {
      const others = periodes.filter((x) => x.id !== p.id && x.isOpen);
      await Promise.all(others.map((x) => onUpdate(x.id, { isOpen: false })));
    }
    await onUpdate(p.id, { isOpen: opening });
  };

  if (loading) return <div className="text-center p-8 text-muted-foreground">Memuat periode...</div>;

  return (
    <div>
      <SectionHeader
        title="Periode Evaluasi"
        subtitle="Kelola periode evaluasi semesteran. Hanya satu periode yang bisa aktif (terbuka) sekaligus."
        action={
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />Buat Periode
          </Button>
        }
      />

      {periodes.length === 0 ? (
        <EmptyState
          title="Belum ada periode evaluasi"
          description="Buat periode evaluasi untuk memulai proses evaluasi semesteran."
          action={<Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Buat Periode</Button>}
        />
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodes.map((p) => {
                const start = p.startDate?.toDate?.();
                const end = p.endDate?.toDate?.();
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium capitalize">{p.semester}</TableCell>
                    <TableCell>{p.tahunAjaran}</TableCell>
                    <TableCell>{start ? format(start, 'dd MMM yyyy', { locale: localeId }) : '—'}</TableCell>
                    <TableCell>{end ? format(end, 'dd MMM yyyy', { locale: localeId }) : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.isOpen}
                          onCheckedChange={() => toggleOpen(p)}
                          aria-label="Toggle periode"
                        />
                        <Badge variant={p.isOpen ? 'default' : 'secondary'}>
                          {p.isOpen ? 'Terbuka' : 'Tertutup'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(p)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus periode ini?</AlertDialogTitle>
                            <AlertDialogDescription>Seluruh data evaluasi dalam periode ini tidak akan terhapus, tetapi periode tidak dapat dipulihkan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(p.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.existing ? 'Edit Periode' : 'Buat Periode Evaluasi'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={(v) => setForm((p) => ({ ...p, semester: v as SemesterType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganjil">Ganjil</SelectItem>
                  <SelectItem value="genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tahun Ajaran</Label>
              <Select value={form.tahunAjaran} onValueChange={(v) => setForm((p) => ({ ...p, tahunAjaran: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Mulai</Label>
                <Input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} />
              </div>
              <div>
                <Label>Tanggal Selesai</Label>
                <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isOpen"
                checked={form.isOpen}
                onCheckedChange={(c) => setForm((p) => ({ ...p, isOpen: c }))}
              />
              <Label htmlFor="isOpen">Buka periode (guru/PJP dapat mengisi evaluasi)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
