import React, { useState, useMemo } from 'react';
import { Generus, PENDIDIKAN_LIST, Pendidikan, STATUS_MONDOK_LIST, StatusMondok, GENERUS_FILTER_FIELDS, getJenjangUsia, Desa, Kelompok, User, JENJANG_USIA_LIST } from '@/types/admin';
import { Edit, Trash2, Plus, Search, Download, Upload } from 'lucide-react';
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
import * as XLSX from 'xlsx';
import { showError } from '@/utils/toast';

interface GenerusSectionProps {
  allGenerus: Generus[];
  desas: Desa[];
  kelompok: Kelompok[];
  newGenerus: Omit<Generus, 'id'>;
  setNewGenerus: React.Dispatch<React.SetStateAction<Omit<Generus, 'id'>>>;
  onAddGenerus: () => Promise<boolean>;
  onUpdateGenerus: (id: string, data: Omit<Generus, 'id'>) => Promise<boolean>;
  onDeleteGenerus: (id: string) => void;
  onAddMultipleGenerus: (generus: Omit<Generus, 'id'>[]) => Promise<boolean>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  currentUser: User | null;
}

const dropdownCategories = ['tahunLahir', 'pendidikan', 'statusMondok', 'desa', 'kelompok', 'jenjangUsia'];
const ITEMS_PER_PAGE = 10;

const findCorrectCase = (list: readonly string[], value: string): string | undefined => {
  const lowercasedValue = value.trim().toLowerCase();
  return list.find(item => item.toLowerCase() === lowercasedValue);
};

export default function GenerusSection({ 
  allGenerus,
  desas,
  kelompok,
  newGenerus, 
  setNewGenerus, 
  onAddGenerus,
  onUpdateGenerus,
  onDeleteGenerus,
  onAddMultipleGenerus,
  searchTerm, 
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  currentUser
}: GenerusSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingGenerus, setEditingGenerus] = useState<Generus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'jenjangUsia') return [...JENJANG_USIA_LIST];
    const uniqueValues = [...new Set(allGenerus.map(item => item[filterCategory as keyof Generus]))];
    return uniqueValues.map(String).sort();
  }, [filterCategory, allGenerus]);

  const filteredGenerus = useMemo(() => {
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredGenerus.length / ITEMS_PER_PAGE);
  const paginatedGenerus = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredGenerus.slice(startIndex, endIndex);
  }, [filteredGenerus, currentPage]);

  const chartData = useMemo(() => {
    const summary: { [key: string]: { name: string; 'Laki-laki': number; 'Perempuan': number } } = {};
    const jenjangOptions = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'];
    jenjangOptions.forEach(j => { summary[j] = { name: j, 'Laki-laki': 0, 'Perempuan': 0 }; });
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
    if (success) setIsAddDialogOpen(false);
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

  const handleEditInputChange = (field: keyof Omit<Generus, 'id'>, value: string | number) => setEditingGenerus(prev => prev ? { ...prev, [field]: value } : null);
  const handleEditSelectChange = (field: keyof Omit<Generus, 'id'>, value: string) => setEditingGenerus(prev => prev ? { ...prev, [field]: value as any } : null);
  const handleNewInputChange = (field: keyof typeof newGenerus, value: string | number) => setNewGenerus(prev => ({ ...prev, [field]: value }));
  const handleNewSelectChange = (field: keyof typeof newGenerus, value: string) => setNewGenerus(prev => ({ ...prev, [field]: value as any }));
  const handleNewDesaChange = (desaName: string) => setNewGenerus(prev => ({ ...prev, desa: desaName, kelompok: '' }));

  const filteredKelompokForNew = useMemo(() => {
    if (!newGenerus.desa) return [];
    return kelompok.filter(k => k.desaName === newGenerus.desa);
  }, [newGenerus.desa, kelompok]);

  const handleExport = () => {
    const dataToExport = filteredGenerus.map(g => ({
      'Nama Generus': g.name, 'Jenis Kelamin': g.jenisKelamin, 'Tahun Lahir': g.tahunLahir, 'Pendidikan': g.pendidikan,
      'Status Mondok': g.statusMondok, 'Nama Ayah': g.namaAyah, 'Status Ayah': g.statusAyah.toUpperCase(),
      'Nama Ibu': g.namaIbu, 'Status Ibu': g.statusIbu.toUpperCase(),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Generus");
    XLSX.writeFile(wb, `data_generus_${currentUser?.kelompok}.xlsx`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];
        const generusToUpload: Omit<Generus, 'id'>[] = json.map((row, index) => {
          const rowNum = index + 2;
          if (!row['Nama Generus']) throw new Error(`Baris ${rowNum}: Nama Generus tidak boleh kosong.`);
          
          const pendidikan = findCorrectCase(PENDIDIKAN_LIST, String(row['Pendidikan'] || '')) as Pendidikan;
          if (!pendidikan) throw new Error(`Baris ${rowNum}: Pendidikan "${row['Pendidikan']}" tidak valid.`);
          
          const statusMondok = findCorrectCase(STATUS_MONDOK_LIST, String(row['Status Mondok'] || '')) as StatusMondok;
          if (!statusMondok) throw new Error(`Baris ${rowNum}: Status Mondok "${row['Status Mondok']}" tidak valid.`);

          return {
            name: String(row['Nama Generus']),
            jenisKelamin: String(row['Jenis Kelamin']) === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
            tahunLahir: Number(row['Tahun Lahir'] || 0),
            pendidikan,
            statusMondok,
            namaAyah: String(row['Nama Ayah'] || ''),
            statusAyah: String(row['Status Ayah'] || '').toLowerCase() as 'jm' | 'hum',
            namaIbu: String(row['Nama Ibu'] || ''),
            statusIbu: String(row['Status Ibu'] || '').toLowerCase() as 'jm' | 'hum',
            desa: currentUser.desa || '',
            kelompok: currentUser.kelompok || '',
          };
        });
        onAddMultipleGenerus(generusToUpload).then(success => { if (success) setIsImportDialogOpen(false); });
      } catch (error: any) { showError(error.message || "Gagal memproses file Excel. Pastikan formatnya benar."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select value={searchTerm} onValueChange={(value) => onSearchChange(value === '--all--' ? '' : value || '')}>
          <SelectTrigger className="w-full flex-grow md:w-[200px]"><SelectValue placeholder={`Pilih ${GENERUS_FILTER_FIELDS.find(f => f.value === filterCategory)?.label}...`} /></SelectTrigger>
          <SelectContent><SelectItem value="--all--">Semua</SelectItem>{searchOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input placeholder="Cari..." className="pl-10" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
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
          <Select value={filterCategory} onValueChange={(value) => { onFilterCategoryChange(value); onSearchChange(''); }}>
            <SelectTrigger className="w-[180px] flex-shrink-0"><SelectValue placeholder="Filter by" /></SelectTrigger>
            <SelectContent>{GENERUS_FILTER_FIELDS.map(field => (<SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>))}</SelectContent>
          </Select>
          {currentUser?.role === 'kelompok' && (
            <>
              <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild><Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Import Data Generus</DialogTitle><DialogDescription>Unggah file Excel untuk menambahkan data generus. Pastikan formatnya sama dengan file hasil export.</DialogDescription></DialogHeader>
                  <div className="py-4"><Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} /></div>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button className="flex-shrink-0"><Plus className="w-4 h-4 mr-2" />Tambah</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader><DialogTitle>Tambah Data Generus</DialogTitle><DialogDescription>Isi formulir di bawah ini untuk menambahkan data generus baru.</DialogDescription></DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Form fields */}
                </div>
              </div>
              <DialogFooter><Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button><Button onClick={handleSave}>Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Table and Pagination */}
    </div>
  );
}