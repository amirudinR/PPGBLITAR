import React, { useMemo } from 'react';
import { Generus, Desa, Kelompok, GENERUS_FILTER_FIELDS, getJenjangUsia, JENJANG_USIA_LIST, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaginationControls from './PaginationControls';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GenerusTableProps {
  allGenerus: Generus[];
  searchTerm: string;
  filterCategory: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  onUpdateGenerus: (id: string, data: Omit<Generus, 'id'>) => Promise<boolean>;
  onDeleteGenerus: (id: string) => Promise<void>; // Changed to Promise<void>
  desas: Desa[];
  kelompok: Kelompok[];
}

const dropdownCategories = ['tahunLahir', 'pendidikan', 'statusMondok', 'desa', 'kelompok', 'jenjangUsia'];
const ITEMS_PER_PAGE = 10;

export default function GenerusTable({
  allGenerus,
  searchTerm,
  filterCategory,
  currentPage,
  setCurrentPage,
  sortConfig,
  setSortConfig,
  onUpdateGenerus,
  onDeleteGenerus,
  desas,
  kelompok
}: GenerusTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingGenerus, setEditingGenerus] = React.useState<Generus | null>(null);

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'jenjangUsia') return [...JENJANG_USIA_LIST];
    const uniqueValues = [...new Set(allGenerus.map(item => item[filterCategory as keyof Generus]))];
    return uniqueValues.map(String).sort();
  }, [filterCategory, allGenerus]);

  const filteredGenerus = useMemo(() => {
    if (!searchTerm) return allGenerus;
    return allGenerus.filter(g => {
      if (filterCategory === 'jenjangUsia') {
        return getJenjangUsia(g.pendidikan) === searchTerm;
      }
      const value = g[filterCategory as keyof Generus];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allGenerus, searchTerm, filterCategory]);

  const sortedGenerus = useMemo(() => {
    let sortableItems = [...filteredGenerus];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'jenjangUsia') {
          const jenjangA = getJenjangUsia(a.pendidikan);
          const jenjangB = getJenjangUsia(b.pendidikan);
          if (jenjangA < jenjangB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (jenjangA > jenjangB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        } else {
          if (a[sortConfig.key as keyof Generus] < b[sortConfig.key as keyof Generus]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key as keyof Generus] > b[sortConfig.key as keyof Generus]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [filteredGenerus, sortConfig]);

  const paginatedGenerus = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedGenerus.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedGenerus, currentPage]);

  const totalPages = Math.ceil(sortedGenerus.length / ITEMS_PER_PAGE);

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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset ke halaman pertama saat sorting berubah
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('name')}
              >
                Nama Generus{getSortIndicator('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('tahunLahir')}
              >
                Tahun Lahir{getSortIndicator('tahunLahir')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('pendidikan')}
              >
                Pendidikan{getSortIndicator('pendidikan')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('jenjangUsia')}
              >
                Jenjang Usia{getSortIndicator('jenjangUsia')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('statusMondok')}
              >
                Status Mondok{getSortIndicator('statusMondok')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('desa')}
              >
                Desa{getSortIndicator('desa')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('kelompok')}
              >
                Kelompok{getSortIndicator('kelompok')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('namaAyah')}
              >
                Nama Ayah{getSortIndicator('namaAyah')}
              </TableHead>
              <TableHead className="whitespace-nowrap">Status Ayah</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                onClick={() => requestSort('namaIbu')}
              >
                Nama Ibu{getSortIndicator('namaIbu')}
              </TableHead>
              <TableHead className="whitespace-nowrap">Status Ibu</TableHead>
              <TableHead className="text-center whitespace-nowrap">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedGenerus.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Edit Dialog */}
      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editingGenerus={editingGenerus}
        handleEditInputChange={handleEditInputChange}
        handleEditSelectChange={handleEditSelectChange}
        handleUpdate={handleUpdate}
        kelompok={kelompok}
      />
    </div>
  );
}

// Subcomponent for Edit Dialog
interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingGenerus: Generus | null;
  handleEditInputChange: (field: keyof Omit<Generus, 'id'>, value: string | number) => void;
  handleEditSelectChange: (field: keyof Omit<Generus, 'id'>, value: string) => void;
  handleUpdate: () => Promise<void>;
  kelompok: Kelompok[];
}

function EditDialog({
  isOpen,
  onClose,
  editingGenerus,
  handleEditInputChange,
  handleEditSelectChange,
  handleUpdate,
  kelompok
}: EditDialogProps) {
  const filteredKelompok = React.useMemo(() => {
    if (!editingGenerus?.desa) return [];
    return kelompok.filter(k => k.desaName === editingGenerus.desa);
  }, [editingGenerus?.desa, kelompok]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Data Generus</AlertDialogTitle>
        </AlertDialogHeader>
        {editingGenerus && (
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Nama Generus</Label>
                <Input id="edit-name" value={editingGenerus.name} onChange={(e) => handleEditInputChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jenisKelamin" className="text-sm font-medium">Jenis Kelamin</Label>
                <Select value={editingGenerus.jenisKelamin} onValueChange={(value) => handleEditSelectChange('jenisKelamin', value)}>
                  <SelectTrigger id="edit-jenisKelamin"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tahunLahir" className="text-sm font-medium">Tahun Lahir</Label>
                <Input id="edit-tahunLahir" type="number" value={editingGenerus.tahunLahir} onChange={(e) => handleEditInputChange('tahunLahir', parseInt(e.target.value, 10) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pendidikan" className="text-sm font-medium">Pendidikan</Label>
                <Select value={editingGenerus.pendidikan} onValueChange={(value) => handleEditSelectChange('pendidikan', value)}>
                  <SelectTrigger id="edit-pendidikan"><SelectValue /></SelectTrigger>
                  <SelectContent>{PENDIDIKAN_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusMondok" className="text-sm font-medium">Status Mondok</Label>
                <Select value={editingGenerus.statusMondok} onValueChange={(value) => handleEditSelectChange('statusMondok', value)}>
                  <SelectTrigger id="edit-statusMondok"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_MONDOK_LIST.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desa" className="text-sm font-medium">Desa</Label>
                <Input id="edit-desa" value={editingGenerus.desa} onChange={(e) => handleEditInputChange('desa', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kelompok" className="text-sm font-medium">Kelompok</Label>
                <Select value={editingGenerus.kelompok} onValueChange={(value) => handleEditSelectChange('kelompok', value)}>
                  <SelectTrigger id="edit-kelompok"><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                  <SelectContent>{filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaAyah" className="text-sm font-medium">Nama Ayah</Label>
                <Input id="edit-namaAyah" value={editingGenerus.namaAyah} onChange={(e) => handleEditInputChange('namaAyah', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusAyah" className="text-sm font-medium">Status Ayah</Label>
                <Select value={editingGenerus.statusAyah} onValueChange={(value) => handleEditSelectChange('statusAyah', value)}>
                  <SelectTrigger id="edit-statusAyah"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-namaIbu" className="text-sm font-medium">Nama Ibu</Label>
                <Input id="edit-namaIbu" value={editingGenerus.namaIbu} onChange={(e) => handleEditInputChange('namaIbu', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-statusIbu" className="text-sm font-medium">Status Ibu</Label>
                <Select value={editingGenerus.statusIbu} onValueChange={(value) => handleEditSelectChange('statusIbu', value)}>
                  <SelectTrigger id="edit-statusIbu"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jm">JM</SelectItem><SelectItem value="hum">HUM</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => handleUpdate()}>Simpan Perubahan</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}