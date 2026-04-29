import React, { useState, useEffect } from 'react';
import { M5U } from '@/types/admin';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

interface M5UDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<M5U, 'id'>, id: string | null, isEdit: boolean) => void;
  isEditMode: boolean;
  currentItem: Omit<M5U, 'id'>;
  editingId: string | null;
}

export default function M5UDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  isEditMode, 
  currentItem,
  editingId
}: M5UDialogProps) {
  const [formData, setFormData] = useState<Omit<M5U, 'id'>>(currentItem);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentItem);
    }
  }, [isOpen, currentItem]);

  const handleChange = (field: keyof Omit<M5U, 'id'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData, editingId, isEditMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Agenda M5U' : 'Tambah Agenda M5U Baru'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bulan">Bulan</Label>
            <Select 
              value={formData.bulan} 
              onValueChange={(value) => handleChange('bulan', value)}
            >
              <SelectTrigger id="bulan" className="mt-1">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tahun">Tahun</Label>
            <Select 
              value={String(formData.tahun)} 
              onValueChange={(value) => handleChange('tahun', Number(value))}
            >
              <SelectTrigger id="tahun" className="mt-1">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-full">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea 
              id="agenda" 
              value={formData.agenda} 
              onChange={(e) => handleChange('agenda', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="hasil">Hasil</Label>
            <Textarea 
              id="hasil" 
              value={formData.hasil} 
              onChange={(e) => handleChange('hasil', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div>
            <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
            <Input 
              id="pj" 
              value={formData.pj} 
              onChange={(e) => handleChange('pj', e.target.value)} 
              className="mt-1" 
            />
          </div>
          <div>
            <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
            <Input 
              id="waktuPelaksanaan" 
              type="date" 
              value={formData.waktuPelaksanaan} 
              onChange={(e) => handleChange('waktuPelaksanaan', e.target.value)} 
              className="mt-1" 
            />
          </div>
          {isEditMode && (
            <div className="col-span-full">
              <Label htmlFor="statusHasil">Status Hasil</Label>
              <Select 
                value={formData.statusHasil} 
                onValueChange={(value) => handleChange('statusHasil', value as M5U['statusHasil'])}
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
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}