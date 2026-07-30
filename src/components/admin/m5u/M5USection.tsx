import React, { useState } from 'react';
import { M5U, User } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Plus } from 'lucide-react';
import M5UStatsCards from './M5UStatsCards';
import M5UDataTable from './M5UDataTable';
import M5UDialog from './M5UDialog';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';

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
  m5uItems: M5U[];
  loading: boolean;
  hasPermission: boolean;
  onAdd: (data: Omit<M5U, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, data: Omit<M5U, 'id'>) => Promise<boolean>;
  onDeleteMultiple: (bulan: string, tahun: number) => Promise<void>;
  onRetry: () => void;
}

export default function M5USection({ currentUser, m5uItems, loading, hasPermission, onAdd, onUpdate, onDeleteMultiple, onRetry }: M5USectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';
  const canAdd = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';

  const handleDelete = (bulan: string, tahun: number) => {
    onDeleteMultiple(bulan, tahun);
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
      success = await onUpdate(id, item);
    } else {
      const itemWithMetadata = {
        ...item,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.role === 'guru' ? (currentUser.id || '') : ''
      };
      success = await onAdd(itemWithMetadata);
    }
    
    if (success) {
      handleCloseDialog();
    }
  };

  // Tampilkan pesan error permission
  if (!hasPermission && !loading) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Akses Ditolak</h3>
              <p className="text-destructive/80 mt-1">
                Anda tidak memiliki izin untuk mengakses data M5U. Pastikan Anda memiliki hak akses yang sesuai.
              </p>
              {currentUser?.role === 'kelompok' && (
                <p className="text-destructive text-sm mt-2">
                  Sebagai PJP Kelompok, Anda hanya dapat mengakses data M5U untuk kelompok {currentUser.kelompok} di desa {currentUser.desa}.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onRetry()}
                aria-label="Muat ulang data M5U"
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
        <SectionHeader
          title="Agenda M5U"
          subtitle="Pantau agenda bulanan dan status pelaksanaannya."
          action={canAdd ? (
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
            </Button>
          ) : null}
        />
        <EmptyState
          title="Belum Ada Data M5U"
          description={
            currentUser?.role === 'kelompok'
              ? `Belum ada agenda M5U untuk kelompok ${currentUser.kelompok}.`
              : 'Belum ada data M5U yang tersedia.'
          }
          action={canAdd ? (
            <Button variant="outline" size="sm" onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda M5U
            </Button>
          ) : null}
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

  if (loading) {
    return <div className="text-center p-8 text-muted-foreground">Memuat data M5U...</div>;
  }

  return (
    <div>
      <SectionHeader
        title="Agenda M5U"
        subtitle="Kelola agenda dan lihat ringkasan eksekusi per periode."
        action={canAdd ? (
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Agenda
          </Button>
        ) : null}
      />
      
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