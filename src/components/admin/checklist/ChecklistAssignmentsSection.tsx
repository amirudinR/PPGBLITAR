import React, { useState } from 'react';
import { User } from '@/types/admin';
import { ChecklistAssignment, ChecklistResponse } from '@/types/checklist';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

const STATUS_CONFIG: Record<ChecklistAssignment['status'], { label: string; color: string; icon: React.ElementType }> = {
  belum: { label: 'Belum Dimulai', color: 'bg-muted text-muted-foreground', icon: Clock },
  proses: { label: 'Sedang Dikerjakan', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Clock },
  selesai: { label: 'Selesai', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  terlambat: { label: 'Terlambat', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle },
};

interface Props {
  currentUser: User | null;
  assignments: ChecklistAssignment[];
  loading: boolean;
  onUpdate: (id: string, data: Partial<ChecklistAssignment>) => Promise<boolean>;
}

export default function ChecklistAssignmentsSection({ currentUser, assignments, loading, onUpdate }: Props) {
  const [fillDialog, setFillDialog] = useState<{ open: boolean; assignment?: ChecklistAssignment }>({ open: false });
  const [responses, setResponses] = useState<Record<string, ChecklistResponse>>({});
  const [filter, setFilter] = useState<ChecklistAssignment['status'] | 'semua'>('semua');

  const filtered = filter === 'semua' ? assignments : assignments.filter((a) => a.status === filter);

  const openFill = (a: ChecklistAssignment) => {
    setResponses({ ...a.responses });
    setFillDialog({ open: true, assignment: a });
  };

  const handleResponse = (itemId: string, value: string | boolean) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { value, completedAt: Timestamp.now() },
    }));
  };

  const handleSubmit = async (submit: boolean) => {
    if (!fillDialog.assignment) return;
    const items = fillDialog.assignment.templateId ? [] : [];
    const totalItems = Object.keys(responses).length || 1;
    const completed = Object.values(responses).filter((r) =>
      r.value !== '' && r.value !== false,
    ).length;
    const progress = Math.round((completed / totalItems) * 100);
    const status: ChecklistAssignment['status'] = submit ? 'selesai' : 'proses';

    await onUpdate(fillDialog.assignment.id, {
      responses,
      progress,
      status,
      ...(submit ? { submittedAt: Timestamp.now() } : {}),
    });
    setFillDialog({ open: false });
  };

  if (loading) return <div className="text-center p-8 text-muted-foreground">Memuat checklist...</div>;

  return (
    <div>
      <SectionHeader
        title="Checklist Saya"
        subtitle="Daftar checklist yang ditugaskan kepada Anda."
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['semua', 'belum', 'proses', 'selesai', 'terlambat'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? 'default' : 'outline'}
            onClick={() => setFilter(s)}
          >
            {s === 'semua' ? 'Semua' : STATUS_CONFIG[s].label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada checklist"
          description={filter === 'semua' ? 'Belum ada checklist yang ditugaskan.' : `Tidak ada checklist berstatus "${filter}".`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const cfg = STATUS_CONFIG[a.status];
            const StatusIcon = cfg.icon;
            const dueDate = a.dueDate?.toDate?.() ?? (a.dueDate ? new Date(a.dueDate) : null);
            const isOverdue = dueDate && dueDate < new Date() && a.status !== 'selesai';
            return (
              <div key={a.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{a.templateNama}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      {dueDate && (
                        <span className={cn(isOverdue && 'text-destructive font-medium')}>
                          Due: {format(dueDate, 'dd MMM yyyy', { locale: localeId })}
                          {isOverdue && ' (Terlambat!)'}
                        </span>
                      )}
                      <span>Progress: {a.progress}%</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={a.progress} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1', cfg.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openFill(a)}>
                      <Eye className="w-4 h-4 mr-1" />
                      {a.status === 'selesai' ? 'Lihat' : 'Isi'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={fillDialog.open} onOpenChange={(o) => setFillDialog({ open: o })}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{fillDialog.assignment?.templateNama}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {fillDialog.assignment?.status === 'selesai' ? (
              <p className="text-sm text-muted-foreground">Checklist ini sudah diselesaikan.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Isi setiap item checklist, lalu klik Simpan atau Selesaikan.</p>
            )}
            <div className="space-y-3">
              {Object.entries(responses).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Item checklist akan tampil di sini saat template terisi.</p>
              )}
              {Object.entries(responses).map(([itemId, resp]) => (
                <div key={itemId} className="flex items-center gap-3 rounded border p-3">
                  <Checkbox
                    checked={resp.value === true}
                    onCheckedChange={(c) => handleResponse(itemId, !!c)}
                    disabled={fillDialog.assignment?.status === 'selesai'}
                  />
                  <span className="text-sm flex-1">{itemId}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFillDialog({ open: false })}>Tutup</Button>
            {fillDialog.assignment?.status !== 'selesai' && (
              <>
                <Button variant="outline" onClick={() => handleSubmit(false)}>Simpan Draft</Button>
                <Button onClick={() => handleSubmit(true)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Selesaikan
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
