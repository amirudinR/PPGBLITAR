import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Generus, Kelompok, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';

interface GenerusEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingGenerus: Generus | null;
  handleEditInputChange: (field: keyof Omit<Generus, 'id'>, value: string | number) => void;
  handleEditSelectChange: (field: keyof Omit<Generus, 'id'>, value: string) => void;
  handleUpdate: () => Promise<void>;
  kelompok: Kelompok[];
}

export default function GenerusEditDialog({
  isOpen,
  onClose,
  editingGenerus,
  handleEditInputChange,
  handleEditSelectChange,
  handleUpdate,
  kelompok
}: GenerusEditDialogProps) {
  const filteredKelompok = React.useMemo(() => {
    if (!editingGenerus?.desa) return [];
    return kelompok.filter(k => k.desaName === editingGenerus.desa);
  }, [editingGenerus?.desa, kelompok]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Data Generus</AlertDialogTitle>
        </AlertDialogHeader>
        {editingGenerus && (
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Nama Generus</Label>
                <Input id="edit-name" value={editingGenerus.name} onChange={(e) => handleEditInputChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jenisKelamin" className="text-sm font-medium">Jenis Kelamin</Label>
                <Select value={editingGenerus.jenisKelamin} onValueChange={(value) => handleEditSelectChange('jenisKelamin', value)}>
                  <SelectTrigger id="edit-jenisKelamin"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tahunLahir" className="text-sm font-medium">Tahun Lahir</Label>
                <Input id="edit-tahunLahir" type="number" value={editingGenerus.tahunLahir} onChange={(e) => handleEditInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pendidikan" className="text-sm font-medium">Pendidikan</Label>
                <Select value={editingGenerus.pendidikan} onValueChange={(value) => handleEditSelectChange('pendidikan', value)}>
                  <SelectTrigger id="edit-pendidikan"><SelectValue /></SelectTrigger>
                  <SelectContent>{PENDIDIKAN_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusMondok" className="text-sm font-medium">Status Mondok</Label>
                <Select value={editingGenerus.statusMondok} onValueChange={(value) => handleEditSelectChange('statusMondok', value)}>
                  <SelectTrigger id="edit-statusMondok"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_MONDOK_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desa" className="text-sm font-medium">Desa</Label>
                <Input id="edit-desa" value={editingGenerus.desa} onChange={(e) => handleEditInputChange('desa', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kelompok" className="text-sm font-medium">Kelompok</Label>
                <Select value={editingGenerus.kelompok} onValueChange={(value) => handleEditSelectChange('kelompok', value)}>
                  <SelectTrigger id="edit-kelompok"><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                  <SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaAyah" className="text-sm font-medium">Nama Ayah</Label>
                <Input id="edit-namaAyah" value={editingGenerus.namaAyah} onChange={(e) => handleEditInputChange('namaAyah', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusAyah" className="text-sm font-medium">Status Ayah</Label>
                <Select value={editingGenerus.statusAyah} onValueChange={(value) => handleEditSelectChange('statusAyah', value)}>
                  <SelectTrigger id="edit-statusAyah"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaIbu" className="text-sm font-medium">Nama Ibu</Label>
                <Input id="edit-namaIbu" value={editingGenerus.namaIbu} onChange={(e) => handleEditInputChange('namaIbu', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusIbu" className="text-sm font-medium">Status Ibu</Label>
                <Select value={editingGenerus.statusIbu} onValueChange={(value) => handleEditSelectChange('statusIbu', value)}>
                  <SelectTrigger id="edit-statusIbu"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => handleUpdate()}>Simpan Perubahan</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
