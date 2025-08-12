import React, { useState } from 'react';
import { Kelompok, Desa } from '@/types/admin';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';

interface KelompokSectionProps {
  kelompok: Kelompok[];
  desas: Desa[];
  onAddKelompok: (name: string, desaId: string) => Promise<boolean>;
  onUpdateKelompok: (id: string, newName: string, newDesaId: string) => Promise<boolean>;
  onDeleteKelompok: (id: string) => void;
}

export default function KelompokSection({ kelompok, desas, onAddKelompok, onUpdateKelompok, onDeleteKelompok }: KelompokSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [kelompokData, setKelompokData] = useState({ id: '', name: '', desaId: '' });

  const openDialog = (kelompokToEdit?: Kelompok) => {
    if (kelompokToEdit) {
      setIsEditMode(true);
      setKelompokData({ id: kelompokToEdit.id, name: kelompokToEdit.name, desaId: kelompokToEdit.desaId });
    } else {
      setIsEditMode(false);
      setKelompokData({ id: '', name: '', desaId: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    let success = false;
    if (isEditMode) {
      success = await onUpdateKelompok(kelompokData.id, kelompokData.name, kelompokData.desaId);
    } else {
      success = await onAddKelompok(kelompokData.name, kelompokData.desaId);
    }

    if (success) {
      setIsDialogOpen(false);
      showSuccess(`Kelompok berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteKelompok(id);
    showSuccess("Kelompok berhasil dihapus.");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Kelompok</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Tambah Kelompok</span>
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kelompok</TableHead>
              <TableHead>Nama Desa</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelompok.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.desaName}</TableCell>
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
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data kelompok secara permanen.
                        </AlertDialogDescription>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="kelompokName">Nama Kelompok</Label>
              <Input 
                id="kelompokName" 
                value={kelompokData.name} 
                onChange={(e) => setKelompokData(prev => ({ ...prev, name: e.target.value }))} 
                className="mt-1"
                placeholder="Contoh: Remaja 1"
              />
            </div>
            <div>
              <Label htmlFor="desa">Desa</Label>
              <Select value={kelompokData.desaId} onValueChange={(value) => setKelompokData(prev => ({ ...prev, desaId: value }))}>
                <SelectTrigger id="desa" className="mt-1">
                  <SelectValue placeholder="Pilih Desa" />
                </SelectTrigger>
                <SelectContent>
                  {desas.map(desa => <SelectItem key={desa.id} value={desa.id}>{desa.name}</SelectItem>)}
                </SelectContent>
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