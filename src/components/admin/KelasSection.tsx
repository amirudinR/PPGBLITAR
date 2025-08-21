import React, { useState, useMemo } from 'react';
import { Kelas, Guru, User, JENJANG_USIA_LIST, JenjangUsia } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KelasSectionProps {
  kelas: Kelas[];
  gurus: Guru[];
  onAddKelas: (kelasData: Omit<Kelas, 'id'>) => Promise<boolean>;
  onUpdateKelas: (id: string, kelasData: Omit<Kelas, 'id'>) => Promise<boolean>;
  onDeleteKelas: (id: string) => void;
  currentUser: User | null;
}

export default function KelasSection({ kelas, gurus, onAddKelas, onUpdateKelas, onDeleteKelas, currentUser }: KelasSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Omit<Kelas, 'id'>>>({
    namaKelas: '', guruId: '', guruName: '', jenjangUsia: 'Caberawit'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const openDialog = (item?: Kelas) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({ namaKelas: '', guruId: '', guruName: '', jenjangUsia: 'Caberawit' });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const desa = currentUser?.desa || '';
    const kelompok = currentUser?.kelompok || '';
    const finalItem = { ...currentItem, desa, kelompok };

    let success = false;
    if (isEditMode && editingId) {
      success = await onUpdateKelas(editingId, finalItem as Omit<Kelas, 'id'>);
    } else {
      success = await onAddKelas(finalItem as Omit<Kelas, 'id'>);
    }
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteKelas(id);
  };

  const handleGuruChange = (guruId: string) => {
    const selectedGuru = gurus.find(g => g.id === guruId);
    setCurrentItem(prev => ({ ...prev, guruId, guruName: selectedGuru?.name || '' }));
  };

  const availableGurus = useMemo(() => {
    if (currentUser?.role === 'desa') {
      return gurus.filter(g => g.desa === currentUser.desa);
    }
    if (currentUser?.role === 'kelompok') {
      return gurus.filter(g => g.desa === currentUser.desa && g.kelompok === currentUser.kelompok);
    }
    return gurus;
  }, [gurus, currentUser]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Kelas</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Guru</TableHead>
              <TableHead>Jenjang Usia</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelas.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.namaKelas}</TableCell>
                <TableCell>{item.guruName}</TableCell>
                <TableCell>{item.jenjangUsia}</TableCell>
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
                        <AlertDialogDescription>Tindakan ini akan menghapus data kelas secara permanen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
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
            <DialogTitle>{isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Nama Kelas</Label>
              <Input value={currentItem.namaKelas} onChange={(e) => setCurrentItem(prev => ({ ...prev, namaKelas: e.target.value }))} />
            </div>
            <div>
              <Label>Guru</Label>
              <Select value={currentItem.guruId} onValueChange={handleGuruChange}>
                <SelectTrigger><SelectValue placeholder="Pilih Guru" /></SelectTrigger>
                <SelectContent>{availableGurus.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jenjang Usia</Label>
              <Select value={currentItem.jenjangUsia} onValueChange={(value) => setCurrentItem(prev => ({ ...prev, jenjangUsia: value as JenjangUsia }))}>
                <SelectTrigger><SelectValue placeholder="Pilih Jenjang Usia" /></SelectTrigger>
                <SelectContent>{JENJANG_USIA_LIST.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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