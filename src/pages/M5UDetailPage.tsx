import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { M5U } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Dummy data untuk demonstrasi
const dummyData: M5U[] = [
  { id: '1', bulan: 'Januari', tahun: 2024, agenda: 'Evaluasi Kegiatan Akhir Tahun', hasil: 'Semua kegiatan berjalan lancar', pj: 'Admin Super', waktuPelaksanaan: '2024-01-15', statusHasil: 'Terlaksana' },
  { id: '2', bulan: 'Januari', tahun: 2024, agenda: 'Rapat Koordinasi Awal Tahun', hasil: 'Disepakati rencana kerja', pj: 'Admin Super', waktuPelaksanaan: '2024-01-20', statusHasil: 'Terlaksana' },
  { id: '3', bulan: 'Februari', tahun: 2024, agenda: 'Perencanaan Program Semester Genap', hasil: 'Program telah disusun', pj: 'Admin', waktuPelaksanaan: '2024-02-10', statusHasil: 'Terlaksana' },
  { id: '4', bulan: 'Februari', tahun: 2024, agenda: 'Pelatihan Guru', hasil: 'Pelatihan selesai', pj: 'Admin', waktuPelaksanaan: '2024-02-15', statusHasil: 'Terlaksana' },
  { id: '5', bulan: 'Maret', tahun: 2024, agenda: 'Persiapan Lomba Antar Kelompok', hasil: '-', pj: 'PJP Desa', waktuPelaksanaan: '2024-03-20', statusHasil: 'Dalam Proses' },
];

export default function M5UDetailPage() {
  const navigate = useNavigate();
  const { bulan, tahun } = useParams<{ bulan: string; tahun: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [m5uItems, setM5uItems] = useState<M5U[]>(dummyData.filter(item => item.bulan === bulan && item.tahun === Number(tahun)));

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isEditMode && editingId) {
      setM5uItems(m5uItems.map(item => item.id === editingId ? { ...currentItem, id: editingId } : item));
    } else {
      setM5uItems([...m5uItems, { ...currentItem, id: new Date().toISOString() }]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setM5uItems(m5uItems.filter(item => item.id !== id));
  };

  const handleChange = (field: keyof Omit<M5U, 'id'>, value: string | number) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detail Agenda M5U</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="font-semibold">Bulan</Label>
            <p className="text-lg">{bulan}</p>
          </div>
          <div>
            <Label className="font-semibold">Tahun</Label>
            <p className="text-lg">{tahun}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Agenda</h2>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Agenda
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agenda</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>Tanggal Pelaksanaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m5uItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.agenda}</TableCell>
                  <TableCell>{item.hasil || '-'}</TableCell>
                  <TableCell>{item.pj}</TableCell>
                  <TableCell>{item.waktuPelaksanaan || '-'}</TableCell>
                  <TableCell>{item.statusHasil || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus agenda ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={(e) => handleChange('agenda', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="hasil">Hasil</Label>
              <Textarea 
                id="hasil" 
                value={currentItem.hasil} 
                onChange={(e) => handleChange('hasil', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
              <Input 
                id="pj" 
                value={currentItem.pj} 
                onChange={(e) => handleChange('pj', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
              <Input 
                id="waktuPelaksanaan" 
                type="date" 
                value={currentItem.waktuPelaksanaan} 
                onChange={(e) => handleChange('waktuPelaksanaan', e.target.value)} 
                className="mt-1" 
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="statusHasil">Status Hasil</Label>
              <Select 
                value={currentItem.statusHasil} 
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