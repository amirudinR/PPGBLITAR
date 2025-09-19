import React, { useState } from 'react';
import { M5U, User } from '@/types/admin';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import M5UStatsCards from './M5UStatsCards';
import M5UDataTable from './M5UDataTable';
import M5UDialog from './M5UDialog';
import M5UDetailDialog from './M5UDetailDialog';

const initialData: M5U[] = [
  { id: '1', bulan: 'Januari', tahun: 2024, agenda: 'Evaluasi Kegiatan Akhir Tahun', hasil: 'Semua kegiatan berjalan lancar', pj: 'Admin Super', waktuPelaksanaan: '2024-01-15', statusHasil: 'Terlaksana' },
  { id: '2', bulan: 'Februari', tahun: 2024, agenda: 'Perencanaan Program Semester Genap', hasil: 'Program telah disusun', pj: 'Admin', waktuPelaksanaan: '2024-02-10', statusHasil: 'Terlaksana' },
  { id: '3', bulan: 'Maret', tahun: 2024, agenda: 'Persiapan Lomba Antar Kelompok', hasil: '-', pj: 'PJP Desa', waktuPelaksanaan: '2024-03-20', statusHasil: 'Dalam Proses' },
  { id: '4', bulan: 'Januari', tahun: 2024, agenda: 'Rapat Koordinasi Awal Tahun', hasil: 'Disepakati rencana kerja', pj: 'Admin Super', waktuPelaksanaan: '2024-01-20', statusHasil: 'Terlaksana' },
  { id: '5', bulan: 'Februari', tahun: 2024, agenda: 'Pelatihan Guru', hasil: 'Pelatihan selesai', pj: 'Admin', waktuPelaksanaan: '2024-02-15', statusHasil: 'Terlaksana' },
];

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
  const [m5uItems, setM5uItems] = useState<M5U[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: '', tahun: new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<M5U | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('bulan');

  const canEdit = currentUser?.role !== 'guru';

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

  const openDetailDialog = (item: M5U) => {
    setDetailItem(item);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailItem(null);
  };

  const handleSave = (item: Omit<M5U, 'id'>, id: string | null, isEdit: boolean) => {
    if (isEdit && id) {
      setM5uItems(m5uItems.map(m => m.id === id ? { ...item, id } : m));
    } else {
      setM5uItems([...m5uItems, { ...item, id: new Date().toISOString() }]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setM5uItems(m5uItems.filter(item => item.id !== id));
  };

  const handleBulkDelete = (bulan: string, tahun: number) => {
    setM5uItems(m5uItems.filter(item => !(item.bulan === bulan && item.tahun === tahun)));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agenda M5U</h2>
      
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
        {canEdit && (
          <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
          </Button>
        )}
      </div>
      
      <M5UDataTable 
        m5uItems={m5uItems}
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        canEdit={canEdit}
        onOpenDetail={openDetailDialog}
        onOpenEdit={openDialog}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
      />
      
      <M5UDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isEditMode={isEditMode}
        currentItem={currentItem}
        editingId={editingId}
      />
      
      <M5UDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={closeDetailDialog}
        item={detailItem}
        m5uItems={m5uItems}
        canEdit={canEdit}
        onEdit={openDialog}
        onDelete={handleDelete}
      />
    </div>
  );
}