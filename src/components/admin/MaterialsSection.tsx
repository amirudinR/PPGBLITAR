import React, { useEffect } from 'react';
import { Material, KELAS_MATERI_LIST, JUDUL_MATERI_LIST } from '@/types/admin';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';

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

  useEffect(() => {
    setNewMaterial(prev => ({ ...prev, targetBulan: '' }));
  }, [newMaterial.semester, setNewMaterial]);

  const currentMonths = newMaterial.semester === 'Ganjil' ? SEMESTER_GANJIL_MONTHS : SEMESTER_GENAP_MONTHS;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kelola Materi</h2>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tambah Materi Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="judulMateri">Judul Materi</Label>
              <Select value={newMaterial.judulMateri} onValueChange={(value) => handleSelectChange('judulMateri', value)}>
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
              <Select value={newMaterial.kelas} onValueChange={(value) => handleSelectChange('kelas', value)}>
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
              <Label htmlFor="targetBulan">Target Bulan</Label>
              <Select value={newMaterial.targetBulan} onValueChange={(value) => handleSelectChange('targetBulan', value)} disabled={!newMaterial.semester}>
                <SelectTrigger id="targetBulan" className="mt-1">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {currentMonths.map(bulan => <SelectItem key={bulan} value={bulan}>{bulan}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="rincianMateri">Rincian Materi</Label>
            <Textarea id="rincianMateri" value={newMaterial.rincianMateri} onChange={(e) => handleInputChange('rincianMateri', e.target.value)} className="mt-1" placeholder="Isi rincian materi di sini" />
          </div>
          <button
            onClick={onAddMaterial}
            className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi</span>
          </button>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell className="font-medium">{material.judulMateri}</TableCell>
                <TableCell className="whitespace-pre-wrap max-w-sm">{material.rincianMateri}</TableCell>
                <TableCell>{material.kelas}</TableCell>
                <TableCell>{material.semester}</TableCell>
                <TableCell>{material.targetBulan}</TableCell>
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