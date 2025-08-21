import React, { useState, useEffect } from 'react';
import { Material, KELAS_MATERI_LIST, JUDUL_MATERI_LIST, JudulMateri, KelasMateri } from '@/types/admin';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import * as XLSX from 'xlsx';
import { showError } from '@/utils/toast';

interface MaterialsSectionProps {
  materials: Material[];
  newMaterial: Omit<Material, 'id'>;
  setNewMaterial: React.Dispatch<React.SetStateAction<Omit<Material, 'id'>>>;
  onAddMaterial: () => Promise<boolean>;
  onUpdateMaterial: (id: string, updatedData: Omit<Material, 'id'>) => Promise<boolean>;
  onDeleteMaterial: (id: string) => void;
  onDeleteMultipleMaterials: (ids: string[]) => void;
  onAddMultipleMaterials: (materials: Omit<Material, 'id'>[]) => Promise<boolean>;
}

// Helper function to find the correct cased value from a list, ignoring case and whitespace
const findCorrectCase = (list: readonly string[], value: string): string | undefined => {
  const lowercasedValue = value.trim().toLowerCase();
  return list.find(item => item.toLowerCase() === lowercasedValue);
};

export default function MaterialsSection({
  materials,
  newMaterial,
  setNewMaterial,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onDeleteMultipleMaterials,
  onAddMultipleMaterials,
}: MaterialsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const materialsToUpload: Omit<Material, 'id'>[] = json.map((row, index) => {
          const rowNum = index + 2;

          // Validate Judul Materi
          const judulMateriRaw = row['Judul Materi'];
          if (!judulMateriRaw) throw new Error(`Baris ${rowNum}: Judul Materi tidak boleh kosong.`);
          const correctJudulMateri = findCorrectCase(JUDUL_MATERI_LIST, String(judulMateriRaw));
          if (!correctJudulMateri) throw new Error(`Baris ${rowNum}: Judul Materi "${judulMateriRaw}" tidak valid.`);

          // Validate Kelas
          const kelasRaw = row['Kelas'];
          if (!kelasRaw) throw new Error(`Baris ${rowNum}: Kelas tidak boleh kosong.`);
          const correctKelas = findCorrectCase(KELAS_MATERI_LIST, String(kelasRaw));
          if (!correctKelas) throw new Error(`Baris ${rowNum}: Kelas "${kelasRaw}" tidak valid.`);

          // Validate Semester
          const semesterRaw = row['Semester'];
          if (!semesterRaw) throw new Error(`Baris ${rowNum}: Semester tidak boleh kosong.`);
          const correctSemester = findCorrectCase(['Ganjil', 'Genap'], String(semesterRaw));
          if (!correctSemester) throw new Error(`Baris ${rowNum}: Semester "${semesterRaw}" harus 'Ganjil' atau 'Genap'.`);

          return {
            judulMateri: correctJudulMateri as JudulMateri,
            rincianMateri: String(row['Rincian Materi'] || '').trim(),
            kelas: correctKelas as KelasMateri,
            semester: correctSemester as 'Ganjil' | 'Genap',
            targetBulan: String(row['Target Bulan'] || '').trim(),
          };
        });

        onAddMultipleMaterials(materialsToUpload).then(success => {
          if (success) setIsUploadDialogOpen(false);
        });

      } catch (error: any) {
        showError(error.message || "Gagal memproses file Excel. Pastikan formatnya benar.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (field: keyof typeof newMaterial, value: string) => {
    setNewMaterial(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof newMaterial, value: string) => {
    setNewMaterial(prev => ({ ...prev, [field]: value as any }));
  };

  useEffect(() => {
    setNewMaterial(prev => ({ ...prev, targetBulan: '' }));
  }, [newMaterial.semester, setNewMaterial]);

  const handleAdd = async () => {
    const success = await onAddMaterial();
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Omit<Material, 'id'>, value: string) => {
    if (editingMaterial) {
      setEditingMaterial({ ...editingMaterial, [field]: value as any });
    }
  };

  const handleUpdate = async () => {
    if (!editingMaterial) return;
    const { id, ...updatedData } = editingMaterial;
    const success = await onUpdateMaterial(id, updatedData);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingMaterial(null);
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedMaterials(materials.map(m => m.id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedMaterials(prev => [...prev, id]);
    } else {
      setSelectedMaterials(prev => prev.filter(materialId => materialId !== id));
    }
  };

  const handleDeleteSelected = () => {
    onDeleteMultipleMaterials(selectedMaterials);
    setSelectedMaterials([]);
  };

  const currentMonths = newMaterial.semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS;
  const editMonths = editingMaterial?.semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kelola Materi</h2>
        <div className="flex items-center gap-2">
          {selectedMaterials.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus ({selectedMaterials.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus {selectedMaterials.length} materi yang dipilih secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Materi dari Excel</DialogTitle>
                <DialogDescription>
                  Unggah file Excel untuk menambahkan beberapa materi sekaligus.
                  Pastikan file memiliki kolom: "Judul Materi", "Rincian Materi", "Kelas", "Semester", dan "Target Bulan".
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Materi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Materi Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="judulMateri">Judul Materi</Label>
                    <Select value={newMaterial.judulMateri} onValueChange={(value) => handleSelectChange('judulMateri', value)}>
                      <SelectTrigger id="judulMateri" className="mt-1">
                        <SelectValue placeholder="Pilih Judul Materi" />
                      </SelectTrigger>
                      <SelectContent>{JUDUL_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kelas">Kelas</Label>
                    <Select value={newMaterial.kelas} onValueChange={(value) => handleSelectChange('kelas', value)}>
                      <SelectTrigger id="kelas" className="mt-1">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>{KELAS_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={newMaterial.semester} onValueChange={(value) => handleSelectChange('semester', value)}>
                      <SelectTrigger id="semester" className="mt-1">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetBulan">Target Bulan</Label>
                    <Select value={newMaterial.targetBulan} onValueChange={(value) => handleSelectChange('targetBulan', value)} disabled={!newMaterial.semester}>
                      <SelectTrigger id="targetBulan" className="mt-1">
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>{currentMonths.map(bulan => <SelectItem key={bulan} value={bulan}>{bulan}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rincianMateri">Rincian Materi</Label>
                  <Textarea id="rincianMateri" value={newMaterial.rincianMateri} onChange={(e) => handleInputChange('rincianMateri', e.target.value)} className="mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button onClick={handleAdd}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedMaterials.length === materials.length && materials.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Pilih semua"
                />
              </TableHead>
              <TableHead>Judul Materi</TableHead>
              <TableHead>Rincian Materi</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Target Bulan</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedMaterials.includes(material.id)}
                    onCheckedChange={(checked) => handleSelectOne(material.id, checked)}
                    aria-label={`Pilih materi ${material.judulMateri}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{material.judulMateri}</TableCell>
                <TableCell className="whitespace-pre-wrap max-w-sm">{material.rincianMateri}</TableCell>
                <TableCell>{material.kelas}</TableCell>
                <TableCell>{material.semester}</TableCell>
                <TableCell>{material.targetBulan}</TableCell>
                <TableCell className="text-center">
                  <button onClick={() => openEditDialog(material)} className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus materi ini secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteMaterial(material.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  <Select value={editingMaterial.judulMateri} onValueChange={(value) => handleEditChange('judulMateri', value)}>
                    <SelectTrigger id="editJudulMateri" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{JUDUL_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editKelas">Kelas</Label>
                  <Select value={editingMaterial.kelas} onValueChange={(value) => handleEditChange('kelas', value)}>
                    <SelectTrigger id="editKelas" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{KELAS_MATERI_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSemester">Semester</Label>
                  <Select value={editingMaterial.semester} onValueChange={(value) => handleEditChange('semester', value)}>
                    <SelectTrigger id="editSemester" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editTargetBulan">Target Bulan</Label>
                  <Select value={editingMaterial.targetBulan} onValueChange={(value) => handleEditChange('targetBulan', value)} disabled={!editingMaterial.semester}>
                    <SelectTrigger id="editTargetBulan" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{editMonths?.map(bulan => <SelectItem key={bulan} value={bulan}>{bulan}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editRincianMateri">Rincian Materi</Label>
                <Textarea id="editRincianMateri" value={editingMaterial.rincianMateri} onChange={(e) => handleEditChange('rincianMateri', e.target.value)} className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}