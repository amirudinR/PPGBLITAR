import React, { useState } from 'react';
import { Announcement, Role } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onAdd: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<boolean>;
  onUpdate: (id: string, data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const TARGET_ROLES: { id: Role; label: string }[] = [
  { id: 'desa', label: 'PJP Desa' },
  { id: 'kelompok', label: 'PJP Kelompok' },
  { id: 'guru', label: 'Guru' },
];

export default function AnnouncementsSection({ announcements, onAdd, onUpdate, onDelete }: AnnouncementsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Announcement>>({ title: '', content: '', targetRoles: [] });

  const openDialog = (item?: Announcement) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
    } else {
      setIsEditMode(false);
      setCurrentItem({ title: '', content: '', targetRoles: [] });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const { id, createdAt, ...data } = currentItem;
    const finalData = { ...data, targetRoles: data.targetRoles || [] } as Omit<Announcement, 'id' | 'createdAt'>;
    
    let success = false;
    if (isEditMode && id) {
      success = await onUpdate(id, finalData);
    } else {
      success = await onAdd(finalData);
    }
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleRoleChange = (role: Role, checked: boolean | 'indeterminate') => {
    const currentRoles = currentItem.targetRoles || [];
    const newRoles = checked ? [...currentRoles, role] : currentRoles.filter(r => r !== role);
    setCurrentItem(prev => ({ ...prev, targetRoles: newRoles }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kelola Pengumuman</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengumuman
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Konten</TableHead>
              <TableHead>Ditujukan Untuk</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="max-w-sm truncate">{item.content}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.targetRoles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-600" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus pengumuman secara permanen.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => onDelete(item.id)}>Hapus</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditMode ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div><Label>Judul</Label><Input value={currentItem.title} onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))} /></div>
            <div><Label>Konten</Label><Textarea value={currentItem.content} onChange={(e) => setCurrentItem(prev => ({ ...prev, content: e.target.value }))} /></div>
            <div>
              <Label>Tampilkan untuk Peran:</Label>
              <div className="flex items-center space-x-4 mt-2">
                {TARGET_ROLES.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox id={role.id} checked={currentItem.targetRoles?.includes(role.id)} onCheckedChange={(checked) => handleRoleChange(role.id, checked)} />
                    <Label htmlFor={role.id}>{role.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button><Button onClick={handleSave}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}