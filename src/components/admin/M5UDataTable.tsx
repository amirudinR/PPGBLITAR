import React, { useMemo } from 'react';
import { M5U } from '@/types/admin';
import { Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface M5UDataTableProps {
  m5uItems: M5U[];
  searchTerm: string;
  filterCategory: string;
  canEdit: boolean;
  onOpenDetail: (item: M5U) => void;
  onOpenEdit: (item?: M5U) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (bulan: string, tahun: number) => void;
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const filterOptions = [
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
    { value: 'pj', label: 'PJ' },
    { value: 'statusHasil', label: 'Status Hasil' },
];

// Subkomponen untuk input pencarian
const SearchInput = ({ 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  dropdownCategories,
  searchOptions
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  dropdownCategories: string[];
  searchOptions: string[];
}) => {
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <Input 
        placeholder="Cari..." 
        className="pl-10" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
    </div>
  );
};

const M5UDataTable = ({ 
  m5uItems, 
  searchTerm, 
  filterCategory, 
  canEdit, 
  onOpenDetail, 
  onOpenEdit, 
  onDelete,
  onBulkDelete
}: M5UDataTableProps) => {
  const dropdownCategories = ['bulan', 'tahun', 'statusHasil'];

  const searchOptions = useMemo(() => {
    if (!dropdownCategories.includes(filterCategory)) return [];
    if (filterCategory === 'bulan') return months;
    if (filterCategory === 'tahun') return years.map(String);
    if (filterCategory === 'statusHasil') return ['Terlaksana', 'Dalam Proses', 'Belum Terlaksana', 'Mansuh'];
    return [];
  }, [filterCategory]);

  // Aggregate data by month and year
  const aggregatedData = useMemo(() => {
    const aggregation: Record<string, { bulan: string; tahun: number; jumlahAgenda: number; items: M5U[] }> = {};
    
    m5uItems.forEach(item => {
      const key = `${item.bulan}-${item.tahun}`;
      if (!aggregation[key]) {
        aggregation[key] = {
          bulan: item.bulan,
          tahun: item.tahun,
          jumlahAgenda: 0,
          items: []
        };
      }
      aggregation[key].jumlahAgenda += 1;
      aggregation[key].items.push(item);
    });
    
    return Object.values(aggregation);
  }, [m5uItems]);

  const filteredAggregatedData = useMemo(() => {
    if (!searchTerm) {
      return aggregatedData;
    }
    return aggregatedData.filter(item => {
      const value = item[filterCategory as keyof typeof item];
      if (dropdownCategories.includes(filterCategory)) {
        return String(value) === searchTerm;
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [aggregatedData, searchTerm, filterCategory]);

  return (
    <div className="bg-white rounded-lg shadow overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bulan</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Jumlah Agenda</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAggregatedData.map((item) => (
            <TableRow key={`${item.bulan}-${item.tahun}`}>
              <TableCell>{item.bulan}</TableCell>
              <TableCell>{item.tahun}</TableCell>
              <TableCell>{item.jumlahAgenda}</TableCell>
              <TableCell className="text-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onOpenDetail(item.items[0])}>
                  <Eye className="w-4 h-4 mr-2" />
                  Detail
                </Button>
                {canEdit && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onOpenEdit()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onOpenEdit(item.items[0])}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus semua agenda dalam periode {item.bulan} {item.tahun}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onBulkDelete(item.bulan, item.tahun)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

M5UDataTable.SearchInput = SearchInput;

export default M5UDataTable;