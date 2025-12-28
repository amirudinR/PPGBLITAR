import React, { useState } from 'react';
import { M5U, User } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Plus } from 'lucide-react';
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
  const { m5uItems, loading, hasPermission, fetchM5U, addM5U, updateM5U, deleteMultipleM5U } = useM5U(currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Update permission logic - PJP Kelompok bisa menambah M5U
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

  // Tampilkan pesan error permission
  if (!hasPermission && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Akses Ditolak</h3>
              <p className="text-red-700 mt-1">
                Anda tidak memiliki izin untuk mengakses data M5U. Pastikan Anda memiliki hak akses yang sesuai.
              </p>
              {currentUser?.role === 'kelompok' && (
                <p className="text-red-600 text-sm mt-2">
                  Sebagai PJP Kelompok, Anda hanya dapat mengakses data M5U untuk kelompok {currentUser.kelompok} di desa {currentUser.desa}.
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => fetchM5U()}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan pesan jika tidak ada data
  if (!loading && m5uItems.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agenda M5U</h2>
          {canAdd && (
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
            </Button>
          )}
        </div>
        <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Belum Ada Data M5U</h3>
              <p className="text-blue-700 mt-1">
                {currentUser?.role === 'kelompok' 
                  ? `Belum ada agenda M5U untuk kelompok ${currentUser.kelompok}.`
                  : 'Belum ada data M5U yang tersedia.'
                }
              </p>
              {canAdd && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => openDialog()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Agenda M5U
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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