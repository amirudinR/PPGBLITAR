import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Material, JUDUL_MATERI_LIST, KELAS_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';

interface AddMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newMaterial: Omit<Material, 'id'>;
  onInputChange: (field: keyof Omit<Material, 'id'>, value: string) => void;
  onSelectChange: (field: keyof Omit<Material, 'id'>, value: string | string[]) => void;
  onSave: () => Promise<void>;
}

export default function AddMaterialDialog({
  isOpen,
  onOpenChange,
  newMaterial,
  onInputChange,
  onSelectChange,
  onSave
}: AddMaterialDialogProps) {
  const currentMonths = newMaterial.semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Materi Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="judulMateri">Judul Materi</Label>
              <Select value={newMaterial.judulMateri} onValueChange={(value) => onSelectChange('judulMateri', value)}>
                <SelectTrigger id="judulMateri" className="mt-1">
                  <SelectValue placeholder="Pilih Judul Materi" />
                </SelectTrigger>
                <SelectContent>
                  {JUDUL_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={newMaterial.kelas} onValueChange={(value) => onSelectChange('kelas', value)}>
                <SelectTrigger id="kelas" className="mt-1">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {KELAS_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={newMaterial.semester} onValueChange={(value) => onSelectChange('semester', value)}>
                <SelectTrigger id="semester" className="mt-1">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetBulan">Target Bulan</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1" disabled={!newMaterial.semester}>
                    {newMaterial.targetBulan.length > 0 ? newMaterial.targetBulan.join(', ') : "Pilih Bulan"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {currentMonths.map(bulan => (
                    <DropdownMenuCheckboxItem 
                      key={bulan} 
                      checked={newMaterial.targetBulan.includes(bulan)} 
                      onCheckedChange={(checked) => {
                        const current = newMaterial.targetBulan;
                        onSelectChange('targetBulan', checked ? [...current, bulan] : current.filter(b => b !== bulan));
                      }}
                    >
                      {bulan}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div>
            <Label htmlFor="rincianMateri">Rincian Materi</Label>
            <Textarea id="rincianMateri" value={newMaterial.rincianMateri} onChange={(e) => onInputChange('rincianMateri', e.target.value)} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSave}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
