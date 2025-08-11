import React from 'react';
import { Material, JENIS_MATERI, JenisMateri } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MaterialsSectionProps {
  materials: Material[];
  newMaterial: Omit<Material, 'id'>;
  setNewMaterial: React.Dispatch<React.SetStateAction<Omit<Material, 'id'>>>;
  onAddMaterial: () => void;
  onDeleteMaterial: (id: string) => void;
}

export default function MaterialsSection({
  materials,
  newMaterial,
  setNewMaterial,
  onAddMaterial,
  onDeleteMaterial,
}: MaterialsSectionProps) {
  const handleInputChange = (field: keyof typeof newMaterial, value: string) => {
    setNewMaterial(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof typeof newMaterial, value: string) => {
    setNewMaterial(prev => ({ ...prev, [field]: value as any }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kelola Materi</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Tambah Materi Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="jenisMateri">Jenis Materi</Label>
            <Select value={newMaterial.jenisMateri} onValueChange={(value) => handleSelectChange('jenisMateri', value)}>
              <SelectTrigger id="jenisMateri" className="mt-1">
                <SelectValue placeholder="Pilih Jenis Materi" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_MATERI.map(jenis => <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="kelas">Kelas</Label>
            <Input id="kelas" value={newMaterial.kelas} onChange={(e) => handleInputChange('kelas', e.target.value)} className="mt-1" placeholder="Contoh: Praremaja" />
          </div>
          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select value={newMaterial.semester} onValueChange={(value) => handleSelectChange('semester', value)}>
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
            <Label htmlFor="bulan">Bulan</Label>
            <Input id="bulan" value={newMaterial.bulan} onChange={(e) => handleInputChange('bulan', e.target.value)} className="mt-1" placeholder="Contoh: Juli" />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Label htmlFor="rincianMateri">Rincian Materi</Label>
            <Textarea id="rincianMateri" value={newMaterial.rincianMateri} onChange={(e) => handleInputChange('rincianMateri', e.target.value)} className="mt-1" placeholder="Isi rincian materi di sini" />
          </div>
        </div>
        <button
          onClick={onAddMaterial}
          className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2 mt-6"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jenis Materi</TableHead>
              <TableHead>Rincian Materi</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Bulan</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.jenisMateri}</TableCell>
                <TableCell className="whitespace-pre-wrap max-w-xs">{material.rincianMateri}</TableCell>
                <TableCell>{material.kelas}</TableCell>
                <TableCell>{material.semester}</TableCell>
                <TableCell>{material.bulan}</TableCell>
                <TableCell className="text-center">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMaterial(material.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}