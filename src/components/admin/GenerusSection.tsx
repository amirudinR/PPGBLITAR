import React, { useState, useMemo } from 'react';
import { Generus, PENDIDIKAN_LIST, Pendidikan, STATUS_MONDOK_LIST, GENERUS_FILTER_FIELDS, getJenjangUsia, Desa, Kelompok, User } from '@/types/admin';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GenerusChart from './GenerusChart';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface GenerusSectionProps {
  allGenerus: Generus[];
  desas: Desa[];
  kelompok: Kelompok[];
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  onAddGenerus: () => Promise<boolean>;
  onUpdateGenerus: (id: string, data: Omit<Generus, 'id'>) => Promise<boolean>;
  onDeleteGenerus: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  currentUser: User | null;
}

const dropdownCategories = ['tahunLahir', 'pendidikan', 'statusMondok', 'desa', 'kelompok'];
const ITEMS_PER_PAGE = 10;

export default function GenerusSection({ 
  allGenerus,
  desas,
  kelompok,
  newGenerus, 
  setNewGenerus, 
  onAddGenerus,
  onUpdateGenerus,
  onDeleteGenerus,
  searchTerm, 
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  currentUser
}: GenerusSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGenerus, setEditingGenerus] = useState<Generus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    const uniqueValues = [...new Set(allGenerus.map(item => item[filterCategory as keyof Generus]))];
    return uniqueValues.map(String).sort();
  }, [filterCategory, allGenerus]);

  const filteredGenerus = useMemo(() => {
    setCurrentPage(1); // Reset to first page on filter change
    if (!searchTerm) return allGenerus;
    return allGenerus.filter(g => {
      const value = g[filterCategory as keyof Generus];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allGenerus, searchTerm, filterCategory]);

  const totalPages = Math.ceil(filteredGenerus.length / ITEMS_PER_PAGE);
  const paginatedGenerus = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredGenerus.slice(startIndex, endIndex);
  }, [filteredGenerus, currentPage]);

  const chartData = useMemo(() => {
    const summary: { [key: string]: { name: string; 'Laki-laki': number; 'Perempuan': number } } = {};
    const jenjangOptions = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'];
    
    jenjangOptions.forEach(j => {
      summary[j] = { name: j, 'Laki-laki': 0, 'Perempuan': 0 };
    });

    filteredGenerus.forEach(g => {
      const jenjang = getJenjangUsia(g.pendidikan);
      if (summary[jenjang]) {
        summary[jenjang][g.jenisKelamin]++;
      }
    });
    return Object.values(summary);
  }, [filteredGenerus]);

  const handleSave = async () => {
    const success = await onAddGenerus();
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingGenerus) return;
    const { id, ...data } = editingGenerus;
    const success = await onUpdateGenerus(id, data);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingGenerus(null);
    }
  };

  const openEditDialog = (generus: Generus) => {
    setEditingGenerus(generus);
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (field: keyof Omit<Generus, 'id'>, value: string | number) => {
    setEditingGenerus(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleEditSelectChange = (field: keyof Omit<Generus, 'id'>, value: string) => {
    setEditingGenerus(prev => prev ? { ...prev, [field]: value as any } : null);
  };
  
  const handleNewInputChange = (field: keyof typeof newGenerus, value: string | number) => {
    setNewGenerus(prev => ({ ...prev, [field]: value }));
  };

  const handleNewSelectChange = (field: keyof typeof newGenerus, value: string) => {
    setNewGenerus(prev => ({ ...prev, [field]: value as any }));
  };

  const handleNewDesaChange = (desaName: string) => {
    setNewGenerus(prev => ({ ...prev, desa: desaName, kelompok: '' }));
  };

  const filteredKelompokForNew = useMemo(() => {
    if (!newGenerus.desa) return [];
    return kelompok.filter(k => k.desaName === newGenerus.desa);
  }, [newGenerus.desa, kelompok]);

  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => onSearchChange(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-full flex-grow md:w-[200px]">
            <SelectValue placeholder={`Pilih ${GENERUS_FILTER_FIELDS.find(f => f.value === filterCategory)?.label}...`} />
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
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Cari..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div>
      <GenerusChart data={chartData} />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Data Generus</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {renderSearchInput()}
          <Select value={filterCategory} onValueChange={(value) => {
            onFilterCategoryChange(value);
            onSearchChange('');
          }}>
            <SelectTrigger className="w-[180px] flex-shrink-0">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              {GENERUS_FILTER_FIELDS.map(field => (
                <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Data Generus</DialogTitle>
                <DialogDescription>
                  Isi formulir di bawah ini untuk menambahkan data generus baru.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* All form fields */}
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Generus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Lahir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenjang Usia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Mondok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ayah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ayah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ibu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ibu</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedGenerus.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.tahunLahir}</TableCell>
                <TableCell>{item.pendidikan}</TableCell>
                <TableCell>{getJenjangUsia(item.pendidikan)}</TableCell>
                <TableCell>{item.statusMondok}</TableCell>
                <TableCell>{item.desa}</TableCell>
                <TableCell>{item.kelompok}</TableCell>
                <TableCell>{item.namaAyah}</TableCell>
                <TableCell className="uppercase">{item.statusAyah}</TableCell>
                <TableCell>{item.namaIbu}</TableCell>
                <TableCell className="uppercase">{item.statusIbu}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
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
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data generus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteGenerus(item.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(p - 1, 1)); }} />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 py-2 text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(p + 1, totalPages)); }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Data Generus</DialogTitle>
          </DialogHeader>
          {editingGenerus && (
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Generus</Label>
                  <Input id="edit-name" value={editingGenerus.name} onChange={(e) => handleEditInputChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-jenisKelamin">Jenis Kelamin</Label>
                  <Select value={editingGenerus.jenisKelamin} onValueChange={(value) => handleEditSelectChange('jenisKelamin', value)}>
                    <SelectTrigger id="edit-jenisKelamin"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tahunLahir">Tahun Lahir</Label>
                  <Input id="edit-tahunLahir" type="number" value={editingGenerus.tahunLahir} onChange={(e) => handleEditInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pendidikan">Pendidikan</Label>
                  <Select value={editingGenerus.pendidikan} onValueChange={(value) => handleEditSelectChange('pendidikan', value)}>
                    <SelectTrigger id="edit-pendidikan"><SelectValue /></SelectTrigger>
                    <SelectContent>{PENDIDIKAN_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-statusMondok">Status Mondok</Label>
                  <Select value={editingGenerus.statusMondok} onValueChange={(value) => handleEditSelectChange('statusMondok', value)}>
                    <SelectTrigger id="edit-statusMondok"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_MONDOK_LIST.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desa">Desa</Label>
                  <Input id="edit-desa" value={editingGenerus.desa} onChange={(e) => handleEditInputChange('desa', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-kelompok">Kelompok</Label>
                  <Input id="edit-kelompok" value={editingGenerus.kelompok} onChange={(e) => handleEditInputChange('kelompok', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-namaAyah">Nama Ayah</Label>
                  <Input id="edit-namaAyah" value={editingGenerus.namaAyah} onChange={(e) => handleEditInputChange('namaAyah', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-statusAyah">Status Ayah</Label>
                  <Select value={editingGenerus.statusAyah} onValueChange={(value) => handleEditSelectChange('statusAyah', value)}>
                    <SelectTrigger id="edit-statusAyah"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-namaIbu">Nama Ibu</Label>
                  <Input id="edit-namaIbu" value={editingGenerus.namaIbu} onChange={(e) => handleEditInputChange('namaIbu', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-statusIbu">Status Ibu</Label>
                  <Select value={editingGenerus.statusIbu} onValueChange={(value) => handleEditSelectChange('statusIbu', value)}>
                    <SelectTrigger id="edit-statusIbu"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                  </Select>
                </div>
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