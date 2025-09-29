import React, { useState } from 'react';
import { M5U, User } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import M5UStatsCards from './M5UStatsCards';
import M5UDataTable from './M5UDataTable';
import M5UDialog from './M5UDialog';
import { useM5U } from '@/hooks/useM5U';

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

interface M5USectionProps {
  currentUser: User | null;
}

export default function M5USection({ currentUser }: M5USectionProps) {
  const { m5uItems, loading, addM5U, updateM5U, deleteMultipleM5U } = useM5U(currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = currentUser?.role !== 'guru';
  const canAdd = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';

  const handleDelete = (bulan: string, tahun: number) => {
    deleteMultipleM5U(bulan, tahun);
  };

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: '', 
        tahun: new Date().getFullYear(), 
        agenda: '', 
        hasil: '', 
        pj: currentUser?.name || '', 
        waktuPelaksanaan: '', 
        statusHasil: ''
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleSave = async (item: Omit<M5U, 'id'>, id: string | null, isEdit: boolean) => {
    let success = false;
    if (isEdit && id) {
      success = await updateM5U(id, item);
    } else {
      // Add desa and kelompok info for role-based access control
      const itemWithMetadata = {
        ...item,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.id || ''
      };
      success = await addM5U(itemWithMetadata);
    }
    
    if (success) {
      handleCloseDialog();
    }
  };

  if (loading) {
    return <div className="text-center p-8">Memuat data M5U...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Agenda M5U</h2>
        {canAdd && (
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Agenda
          </Button>
        )}
      </div>
      
      <M5UStatsCards m5uItems={m5uItems} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <M5UDataTable.SearchInput 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            dropdownCategories={['bulan', 'tahun', 'statusHasil']}
            searchOptions={
              filterCategory === 'bulan' ? months :
              filterCategory === 'tahun' ? years.map(String) :
              filterCategory === 'statusHasil' ? ['Terlaksana', 'Dalam Proses', 'Belum Terlaksana', 'Mansuh'] :
              []
            }
          />
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
        </div>
      </div>
      
      <M5UDataTable 
        m5uItems={m5uItems}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        canEdit={canEdit}
        onOpenDetail={() => {}}
        onDelete={handleDelete}
      />

      <M5UDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        isEditMode={isEditMode}
        currentItem={currentItem}
        editingId={editingId}
      />
    </div>
  );
}