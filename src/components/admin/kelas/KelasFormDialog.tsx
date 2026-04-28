import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Kelas, Guru, JenjangUsia, Desa, Kelompok, JENJANG_USIA_LIST } from '@/types/admin';

interface KelasFormData {
  namaKelas: string;
  guruId: string;
  guruName: string;
  jenjangUsia: JenjangUsia;
  desa: string;
  kelompok: string;
}

interface KelasFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEditMode: boolean;
  formData: KelasFormData;
  onFormDataChange: (data: KelasFormData) => void;
  onGuruChange: (guruId: string) => void;
  availableGurus: Guru[];
  desas: Desa[];
  filteredKelompok: Kelompok[];
  isAdmin: boolean;
}

export default function KelasFormDialog({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  formData,
  onFormDataChange,
  onGuruChange,
  availableGurus,
  desas,
  filteredKelompok,
  isAdmin
}: KelasFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isAdmin && (
            <>
              <div>
                <Label>Desa</Label>
                <Select 
                  value={formData.desa} 
                  onValueChange={desa => onFormDataChange({ ...formData, desa, kelompok: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Desa" />
                  </SelectTrigger>
                  <SelectContent>
                    {desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kelompok</Label>
                <Select 
                  value={formData.kelompok} 
                  onValueChange={kelompok => onFormDataChange({ ...formData, kelompok })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelompok" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div>
            <Label>Nama Kelas</Label>
            <Input 
              value={formData.namaKelas} 
              onChange={(e) => onFormDataChange({ ...formData, namaKelas: e.target.value })} 
            />
          </div>
          <div>
            <Label>Guru</Label>
            <Select 
              value={formData.guruId} 
              onValueChange={onGuruChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Guru" />
              </SelectTrigger>
              <SelectContent>
                {availableGurus.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Jenjang Usia</Label>
            <Select 
              value={formData.jenjangUsia} 
              onValueChange={(value) => onFormDataChange({ ...formData, jenjangUsia: value as JenjangUsia })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenjang Usia" />
              </SelectTrigger>
              <SelectContent>
                {JENJANG_USIA_LIST.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
