import React, { useState, useMemo } from 'react';
import { Guru, GURU_STATUS_LIST, User, Desa, Kelompok } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GuruSectionProps {
  gurus: Guru[];
  onAddGuru: (guruData: Omit<Guru, 'id' | 'userId'>) => Promise<boolean>;
  onUpdateGuru: (id: string, guruData: Omit<Guru, 'id' | 'password'>) => Promise<boolean>;
  onDeleteGuru: (guru: Guru) => void;
  currentUser: User | null;
  desas: Desa[];
  kelompok: Kelompok[];
}

export default function GuruSection({ gurus, onAddGuru, onUpdateGuru, onDeleteGuru, currentUser, desas, kelompok }: GuruSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Guru>>({
    name: '', status: 'MT', phone: '', desa: '', kelompok: '', email: '', password: ''
  });
  
  const openDialog = (item?: Guru) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
    } else {
      setIsEditMode(false);
      let defaultDesa = '';
      let defaultKelompok = '';
      if (currentUser?.role === 'desa') {
        defaultDesa = currentUser.desa || '';
      } else if (currentUser?.role === 'kelompok') {
        defaultDesa = currentUser.desa || '';
        defaultKelompok = currentUser.kelompok || '';
      }
      setCurrentItem({ name: '', status: 'MT', phone: '', desa: defaultDesa, kelompok: defaultKelompok, email: '', password: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    let success = false;
    if (isEditMode && currentItem.id) {
      const { id, password, ...updateData } = currentItem;
      success = await onUpdateGuru(id, updateData as Omit<Guru, 'id' | 'password'>);
    } else {
      const { id, userId, ...addData } = currentItem;
      success = await onAddGuru(addData as Omit<Guru, 'id' | 'userId'>);
    }
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (guru: Guru) => {
    onDeleteGuru(guru);
  };

  const filteredKelompok = useMemo(() => {
    if (!currentItem.desa) return [];
    return kelompok.filter(k => k.desaName === currentItem.desa);
  }, [currentItem.desa, kelompok]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Guru</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Guru
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Guru</TableHead>
              <TableHead>Status Guru</TableHead>
              <TableHead>No HP</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Kelompok</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gurus.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.desa}</TableCell>
                <TableCell>{item.kelompok}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini akan menghapus data guru dan akun terkait secara permanen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Data Guru' : 'Tambah Data Guru Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div><Label>Nama Guru</Label><Input value={currentItem.name} onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={currentItem.email} onChange={(e) => setCurrentItem(prev => ({ ...prev, email: e.target.value }))} disabled={isEditMode} /></div>
            {!isEditMode && (<div><Label>Password</Label><Input type="password" value={currentItem.password} onChange={(e) => setCurrentItem(prev => ({ ...prev, password: e.target.value }))} /></div>)}
            <div><Label>Status Guru</Label><Select value={currentItem.status} onValueChange={(value) => setCurrentItem(prev => ({ ...prev, status: value as Guru['status'] }))}><SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger><SelectContent>{GURU_STATUS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Desa</Label><Select value={currentItem.desa} onValueChange={desa => setCurrentItem(prev => ({ ...prev, desa, kelompok: '' }))} disabled={currentUser?.role === 'desa' || currentUser?.role === 'kelompok'}><SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger><SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Kelompok</Label><Select value={currentItem.kelompok} onValueChange={kelompok => setCurrentItem(prev => ({ ...prev, kelompok }))} disabled={currentUser?.role === 'kelompok'}><SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger><SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>No HP</Label><Input value={currentItem.phone} onChange={(e) => setCurrentItem(prev => ({ ...prev, phone: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}