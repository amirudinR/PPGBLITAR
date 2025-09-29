import React, { useState } from 'react';
import { M5U, User } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import M5UStatsCards from './M5UStatsCards';
import M5UDataTable from './M5UDataTable';
import M5UDialog from './M5UDialog';
import { useM5U } from '@/hooks/useM5U';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

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
  const { m5uItems, loading, addM5U, updateM5U, deleteM5U, deleteMultipleM5U } = useM5U(currentUser);
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

  // Check if user has permission to view M5U data
  const hasPermission = currentUser?.role === 'adminsuper' || 
                       currentUser?.role === 'admin' || 
                       currentUser?.role === 'desa' || 
                       currentUser?.role === 'kelompok' || 
                       currentUser?.role === 'guru' || 
                       currentUser?.role === 'orangtua';

  const filteredM5UItems = React.useMemo(() => {
    return m5uItems.filter(item => 
      item.bulan === searchTerm || 
      item.tahun.toString() === searchTerm ||
      item.agenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.statusHasil?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [m5uItems, searchTerm]);

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
        bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    let success = false;
    if (isEditMode && editingId) {
      success = await updateM5U(editingId, currentItem);
    } else {
      // Add desa and kelompok info for role-based access control
      const itemWithMetadata = {
        ...currentItem,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.id || ''
      };
      success = await addM5U(itemWithMetadata);
    }
    
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="p-6 text-center">Memuat data M5U...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="p-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Akses Dibatasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              Anda tidak memiliki izin untuk mengakses data M5U. Silakan hubungi administrator untuk mendapatkan akses yang sesuai.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
      
      {m5uItems.length > 0 && <M5UStatsCards m5uItems={m5uItems} />}
      
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
      
      {m5uItems.length === 0 && !loading ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Belum Ada Data M5U</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              {currentUser?.role === 'kelompok' 
                ? 'Belum ada agenda M5U untuk kelompok Anda. Silakan tambahkan agenda M5U untuk memulai.'
                : 'Belum ada data M5U yang tersedia.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <M5UDataTable 
          m5uItems={filteredM5UItems}
          searchTerm={searchTerm}
          filterCategory={filterCategory}
          canEdit={canEdit}
          onOpenDetail={() => {}}
          onDelete={handleDelete}
        />
      )}

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