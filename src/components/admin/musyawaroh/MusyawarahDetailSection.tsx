import React, { useState, useEffect } from 'react';
import { User, M5U, M5UAttendee, M5UActionItem } from '@/types/admin';
import { useM5U } from '@/hooks/useM5U';
import { useMusyawaroh } from '@/hooks/useMusyawaroh';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Users, ClipboardList, FileText } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { STATUS_HADIR_LABELS, STATUS_HADIR_COLORS } from './constants';
import AttendeeDialog from './AttendeeDialog';
import ActionItemDialog from './ActionItemDialog';
import NotulensiEditor from './NotulensiEditor';
import ActionItemsList from './ActionItemsList';

interface Props {
  currentUser: User | null;
}

export default function MusyawarahDetailSection({ currentUser }: Props) {
  const { m5uItems, loading: loadingM5U } = useM5U(currentUser);
  const [selectedM5UId, setSelectedM5UId] = useState<string | null>(null);
  const selectedM5U = m5uItems.find((m) => m.id === selectedM5UId) ?? null;

  const {
    attendees, actionItems, loading,
    upsertAttendee, addActionItem, updateActionItem, deleteActionItem, updateNotulensi,
  } = useMusyawaroh(currentUser, selectedM5UId);

  const [notulensiText, setNotulensiText] = useState('');
  const [notulensiEditing, setNotulensiEditing] = useState(false);

  useEffect(() => {
    setNotulensiText(selectedM5U?.notulensi ?? '');
    setNotulensiEditing(false);
  }, [selectedM5UId, selectedM5U?.notulensi]);

  const canEdit = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin'
    || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';

  const [attendeeDialog, setAttendeeDialog] = useState<{ open: boolean; existing?: M5UAttendee }>({ open: false });
  const [attendeeForm, setAttendeeForm] = useState<Omit<M5UAttendee, 'id'>>({
    userId: '', name: '', role: 'guru', desa: '', kelompok: '',
    status: 'hadir', markedBy: currentUser?.id ?? '',
  });

  const openAttendeeDialog = (a?: M5UAttendee) => {
    setAttendeeForm(a ? { ...a } : {
      userId: '', name: '', role: 'guru', desa: currentUser?.desa ?? '',
      kelompok: currentUser?.kelompok ?? '', status: 'hadir', markedBy: currentUser?.id ?? '',
    });
    setAttendeeDialog({ open: true, existing: a });
  };

  const handleSaveAttendee = async () => {
    await upsertAttendee(attendeeForm, attendeeDialog.existing?.id);
    setAttendeeDialog({ open: false });
  };

  const [aiDialog, setAiDialog] = useState<{ open: boolean; existing?: M5UActionItem }>({ open: false });
  const [aiForm, setAiForm] = useState<Omit<M5UActionItem, 'id'>>({
    deskripsi: '', pj: '', pjName: '', dueDate: '', status: 'belum',
  });

  const openAiDialog = (ai?: M5UActionItem) => {
    setAiForm(ai ? { ...ai } : {
      deskripsi: '', pj: currentUser?.id ?? '', pjName: currentUser?.name ?? '',
      dueDate: '', status: 'belum',
    });
    setAiDialog({ open: true, existing: ai });
  };

  const handleSaveAi = async () => {
    const payload = {
      ...aiForm,
      dueDate: aiForm.dueDate ? Timestamp.fromDate(new Date(aiForm.dueDate as string)) : null,
    };
    if (aiDialog.existing) {
      await updateActionItem(aiDialog.existing.id, payload);
    } else {
      await addActionItem(payload as Omit<M5UActionItem, 'id'>);
    }
    setAiDialog({ open: false });
  };

  if (loadingM5U) {
    return <div className="text-center p-8 text-muted-foreground">Memuat data musyawaroh...</div>;
  }

  return (
    <div>
      <SectionHeader
        title="Detail & Absensi Musyawaroh"
        subtitle="Pilih agenda M5U untuk melihat detail, absensi, notulensi, dan action items."
      />

      <div className="mb-6">
        <Label className="mb-2 block">Pilih Agenda Musyawaroh</Label>
        <Select value={selectedM5UId ?? ''} onValueChange={(v) => setSelectedM5UId(v || null)}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="— Pilih agenda —" />
          </SelectTrigger>
          <SelectContent>
            {m5uItems.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.bulan} {m.tahun} — {m.agenda.slice(0, 50)}{m.agenda.length > 50 ? '…' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedM5U ? (
        <EmptyState
          title="Pilih agenda musyawaroh"
          description="Pilih salah satu agenda dari dropdown di atas untuk melihat detail, absensi, notulensi, dan action items."
        />
      ) : (
        <>
          <div className="mb-6 rounded-lg border bg-card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">Periode</p><p className="font-medium">{selectedM5U.bulan} {selectedM5U.tahun}</p></div>
            <div><p className="text-muted-foreground">PJ</p><p className="font-medium">{selectedM5U.pj}</p></div>
            <div><p className="text-muted-foreground">Waktu</p><p className="font-medium">{selectedM5U.waktuPelaksanaan || '—'}</p></div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="secondary">{selectedM5U.statusHasil || 'Belum diset'}</Badge>
            </div>
            {selectedM5U.lokasi && <div><p className="text-muted-foreground">Lokasi</p><p className="font-medium">{selectedM5U.lokasi}</p></div>}
            {selectedM5U.linkMeet && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Link Meet</p>
                <a href={selectedM5U.linkMeet} target="_blank" rel="noreferrer" className="text-primary underline truncate">{selectedM5U.linkMeet}</a>
              </div>
            )}
          </div>

          <Tabs defaultValue="absensi">
            <TabsList className="mb-4">
              <TabsTrigger value="absensi"><Users className="w-4 h-4 mr-2" />Absensi ({attendees.length})</TabsTrigger>
              <TabsTrigger value="notulensi"><FileText className="w-4 h-4 mr-2" />Notulensi</TabsTrigger>
              <TabsTrigger value="action-items"><ClipboardList className="w-4 h-4 mr-2" />Action Items ({actionItems.length})</TabsTrigger>
            </TabsList>

            {/* ─────────────── ABSENSI TAB ─────────────── */}
            <TabsContent value="absensi">
              {canEdit && (
                <div className="mb-4">
                  <Button size="sm" onClick={() => openAttendeeDialog()}>
                    <Plus className="w-4 h-4 mr-2" />Tambah Peserta
                  </Button>
                </div>
              )}
              {attendees.length === 0 ? (
                <EmptyState title="Belum ada data absensi" description="Tambahkan peserta dan tandai kehadiran mereka." />
              ) : (
                <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead>Desa</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Keterangan</TableHead>
                        {canEdit && <TableHead className="text-center">Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.name}</TableCell>
                          <TableCell>{a.role}</TableCell>
                          <TableCell>{a.desa}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_HADIR_COLORS[a.status]}`}>
                              {STATUS_HADIR_LABELS[a.status]}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{a.keterangan || '—'}</TableCell>
                          {canEdit && (
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => openAttendeeDialog(a)}>
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ─────────────── NOTULENSI TAB ─────────────── */}
            <TabsContent value="notulensi">
              <NotulensiEditor
                text={notulensiText}
                editing={notulensiEditing}
                onTextChange={setNotulensiText}
                onToggleEdit={() => setNotulensiEditing(true)}
                onSave={async () => { await updateNotulensi(notulensiText); setNotulensiEditing(false); }}
                onCancel={() => { setNotulensiText(selectedM5U.notulensi ?? ''); setNotulensiEditing(false); }}
                canEdit={canEdit}
              />
            </TabsContent>

            {/* ─────────────── ACTION ITEMS TAB ─────────────── */}
            <TabsContent value="action-items">
              {canEdit && (
                <div className="mb-4">
                  <Button size="sm" onClick={() => openAiDialog()}>
                    <Plus className="w-4 h-4 mr-2" />Tambah Action Item
                  </Button>
                </div>
              )}
              {actionItems.length === 0 ? (
                <EmptyState title="Belum ada action items" description="Tambahkan tindak lanjut hasil musyawaroh." />
              ) : (
                <ActionItemsList
                  items={actionItems}
                  canEdit={canEdit}
                  onEdit={openAiDialog}
                  onDelete={deleteActionItem}
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ─────────────── ATTENDEE DIALOG ─────────────── */}
      <AttendeeDialog
        open={attendeeDialog.open}
        onOpenChange={(o) => setAttendeeDialog({ open: o })}
        existing={attendeeDialog.existing}
        form={attendeeForm}
        onFormChange={setAttendeeForm}
        onSave={handleSaveAttendee}
      />

      {/* ─────────────── ACTION ITEM DIALOG ─────────────── */}
      <ActionItemDialog
        open={aiDialog.open}
        onOpenChange={(o) => setAiDialog({ open: o })}
        existing={aiDialog.existing}
        form={aiForm}
        onFormChange={setAiForm}
        onSave={handleSaveAi}
      />
    </div>
  );
}
