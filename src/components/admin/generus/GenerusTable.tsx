import React, { useMemo } from 'react';
import { Generus, Desa, Kelompok, GENERUS_FILTER_FIELDS, getJenjangUsia, JENJANG_USIA_LIST } from '@/types/admin';
import { Table, TableBody } from "@/components/ui/table";
import PaginationControls from '../layout/PaginationControls';
import GenerusTableHeader from './GenerusTableHeader';
import GenerusTableRow from './GenerusTableRow';
import GenerusEditDialog from './GenerusEditDialog';

interface GenerusTableProps {
  allGenerus: Generus[];
  searchTerm: string;
  filterCategory: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  onUpdateGenerus: (id: string, data: Omit<Generus, 'id'>) => Promise<boolean>;
  onDeleteGenerus: (id: string) => Promise<void>; 
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
    setCurrentPage(1); 
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const handleDeleteWithConfirmation = (id: string) => {
    onDeleteGenerus(id);
  };

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <GenerusTableHeader requestSort={requestSort} getSortIndicator={getSortIndicator} />
          <TableBody>
            {paginatedGenerus.map((item) => (
              <GenerusTableRow 
                key={item.id} 
                generus={item}
                onEdit={openEditDialog}
                onDelete={handleDeleteWithConfirmation}
              />
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

      <GenerusEditDialog
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