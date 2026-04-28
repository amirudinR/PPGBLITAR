import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Material, JUDUL_MATERI_LIST, KELAS_MATERI_LIST, SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';

interface EditMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: Material | null;
  onEditChange: (field: keyof Omit<Material, 'id'>, value: string | string[]) => void;
  onUpdate: () => Promise<void>;
}

export default function EditMaterialDialog({
  isOpen,
  onOpenChange,
  editingMaterial,
  onEditChange,
  onUpdate
}: EditMaterialDialogProps) {
  const editMonths = editingMaterial?.semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Materi</DialogTitle>
          <DialogDescription>Perbarui detail materi di bawah ini.</DialogDescription>
        </DialogHeader>
        {editingMaterial && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editJudulMateri">Judul Materi</Label>
                <Select value={editingMaterial.judulMateri} onValueChange={(value) => onEditChange('judulMateri', value)}>
                  <SelectTrigger id="editJudulMateri" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JUDUL_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editKelas">Kelas</Label>
                <Select value={editingMaterial.kelas} onValueChange={(value) => onEditChange('kelas', value)}>
                  <SelectTrigger id="editKelas" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KELAS_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editSemester">Semester</Label>
                <Select value={editingMaterial.semester} onValueChange={(value) => onEditChange('semester', value)}>
                  <SelectTrigger id="editSemester" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                    <SelectItem value="Genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editTargetBulan">Target Bulan</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start mt-1" disabled={!editingMaterial.semester}>
                      {(editingMaterial.targetBulan || []).length > 0 ? editingMaterial.targetBulan.join(', ') : "Pilih Bulan"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {editMonths?.map(bulan => (
                      <DropdownMenuCheckboxItem 
                        key={bulan} 
                        checked={(editingMaterial.targetBulan || []).includes(bulan)} 
                        onCheckedChange={(checked) => {
                          const current = editingMaterial.targetBulan || [];
                          onEditChange('targetBulan', checked ? [...current, bulan] : current.filter(b => b !== bulan));
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
              <Label htmlFor="editRincianMateri">Rincian Materi</Label>
              <Textarea id="editRincianMateri" value={editingMaterial.rincianMateri} onChange={(e) => onEditChange('rincianMateri', e.target.value)} className="mt-1" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onUpdate}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
