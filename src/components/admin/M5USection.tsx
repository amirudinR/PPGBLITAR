import React, { useState, useMemo } from 'react';
import { M5U } from '@/types/admin';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialData: M5U[] = [
  { id: '1', bulan: 'Januari', tahun: 2024, agenda: 'Evaluasi Kegiatan Akhir Tahun', hasil: 'Semua kegiatan berjalan lancar', pj: 'Admin Super', waktuPelaksanaan: '2024-01-15', statusHasil: 'Terlaksana' },
  { id: '2', bulan: 'Februari', tahun: 2024, agenda: 'Perencanaan Program Semester Genap', hasil: 'Program telah disusun', pj: 'Admin', waktuPelaksanaan: '2024-02-10', statusHasil: 'Terlaksana' },
  { id: '3', bulan: 'Maret', tahun: 2024, agenda: 'Persiapan Lomba Antar Kelompok', hasil: '-', pj: 'PJP Desa', waktuPelaksanaan: '2024-03-20', statusHasil: 'Dalam Proses' },
];

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const filterOptions = [
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
    { value: 'agenda', label: 'Agenda' },
    { value: 'hasil', label: 'Hasil' },
    { value: 'pj', label: 'PJ' },
    { value: 'statusHasil', label: 'Status Hasil' },
];

export default function M5USection() {
  const [m5uItems, setM5uItems] = useState<M5U[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('agenda');

  const dropdownCategories = ['bulan', 'tahun', 'statusHasil'];

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'bulan') return months;
    if (filterCategory === 'tahun') return years.map(String);
    if (filterCategory === 'statusHasil') return ['Terlaksana', 'Dalam Proses', 'Belum Terlaksana', 'Mansuh'];
    return [];
  }, [filterCategory]);

  const filteredM5uItems = useMemo(() => {
    if (!searchTerm) {
      return m5uItems;
    }
    return m5uItems.filter(item => {
      const value = item[filterCategory as keyof M5U];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [m5uItems, searchTerm, filterCategory]);

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: months[new Date().getMonth()], tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
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

  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => setSearchTerm(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={`Pilih ${filterOptions.find(f => f.value === filterCategory)?.label}...`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="--all--">Semua</SelectItem>
            {searchOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Cari..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Musyawarah 5 Unsur (M5U)</h2>
        <div className="flex items-center gap-2">
            {renderSearchInput()}
            <Select value={filterCategory} onValueChange={(value) => {
                setFilterCategory(value);
                setSearchTerm('');
            }}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {filterOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Agenda
            </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bulan</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Agenda</TableHead>
              <TableHead>Hasil</TableHead>
              <TableHead>PJ</TableHead>
              <TableHead>Waktu Pelaksanaan</TableHead>
              <TableHead>Status Hasil</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredM5uItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.bulan}</TableCell>
                <TableCell>{item.tahun}</TableCell>
                <TableCell>{item.agenda}</TableCell>
                <TableCell>{item.hasil}</TableCell>
                <TableCell>{item.pj}</TableCell>
                <TableCell>{item.waktuPelaksanaan}</TableCell>
                <TableCell>{item.statusHasil}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini akan menghapus agenda M5U secara permanen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Agenda M5U' : 'Tambah Agenda M5U Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bulan">Bulan</Label>
              <Input id="bulan" value={currentItem.bulan} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tahun">Tahun</Label>
              <Input id="tahun" value={String(currentItem.tahun)} disabled className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea id="agenda" value={currentItem.agenda} onChange={(e) => setCurrentItem(prev => ({ ...prev, agenda: e.target.value }))} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="hasil">Hasil</Label>
              <Textarea id="hasil" value={currentItem.hasil} onChange={(e) => setCurrentItem(prev => ({ ...prev, hasil: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="pj">Penanggung Jawab (PJ)</Label>
              <Input id="pj" value={currentItem.pj} onChange={(e) => setCurrentItem(prev => ({ ...prev, pj: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan</Label>
              <Input id="waktuPelaksanaan" type="date" value={currentItem.waktuPelaksanaan} onChange={(e) => setCurrentItem(prev => ({ ...prev, waktuPelaksanaan: e.target.value }))} className="mt-1" />
            </div>
            {isEditMode && (
              <div className="col-span-2">
                <Label htmlFor="statusHasil">Status Hasil</Label>
                <Select value={currentItem.statusHasil} onValueChange={(value) => setCurrentItem(prev => ({ ...prev, statusHasil: value as M5U['statusHasil'] }))}>
                  <SelectTrigger id="statusHasil" className="mt-1"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
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
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}