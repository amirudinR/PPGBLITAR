import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from "@/components/ui/button";
import { M5U } from '@/types/admin';

interface M5UFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  currentItem: Omit<M5U, 'id'>;
  onInputChange: (field: keyof Omit<M5U, 'id'>, value: string | number) => void;
  onSave: () => Promise<void>;
}

export default function M5UFormDialog({
  isOpen,
  onOpenChange,
  isEditMode,
  currentItem,
  onInputChange,
  onSave
}: M5UFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Agenda M5U' : 'Tambah Agenda M5U Baru'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea 
              id="agenda" 
              value={currentItem.agenda} 
              onChange={(e) => onInputChange('agenda', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="hasil">Hasil</Label>
            <Textarea 
              id="hasil" 
              value={currentItem.hasil} 
              onChange={(e) => onInputChange('hasil', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div>
            <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
            <Input 
              id="pj" 
              value={currentItem.pj} 
              onChange={(e) => onInputChange('pj', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div>
            <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
            <Input 
              id="waktuPelaksanaan" 
              type="date" 
              value={currentItem.waktuPelaksanaan} 
              onChange={(e) => onInputChange('waktuPelaksanaan', e.target.value)} 
              className="mt-1" 
            />
          </div>
          {isEditMode && (
            <div className="col-span-2">
              <Label htmlFor="statusHasil">Status Hasil</Label>
              <Select 
                value={currentItem.statusHasil} 
                onValueChange={(value) => onInputChange('statusHasil', value as M5U['statusHasil'])}
              >
                <SelectTrigger id="statusHasil" className="mt-1">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Terlaksana">Terlaksana</SelectItem>
                  <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                  <SelectItem value="Belum Terlaksana">Belum Terlaksana</SelectItem>
                  <SelectItem value="Mansuh">Mansuh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
