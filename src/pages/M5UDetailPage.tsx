import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { M5U, User } from '@/types/admin';
import { useM5U } from '@/hooks/useM5U';
import M5UHeader from '@/components/m5u/M5UHeader';
import M5UInfo from '@/components/m5u/M5UInfo';
import M5UTable from '@/components/m5u/M5UTable';
import M5UFormDialog from '@/components/m5u/M5UFormDialog';
import { generateM5UPDF } from '@/utils/m5uPdfUtils';

interface M5UDetailPageProps {
  currentUser: User | null;
}

export default function M5UDetailPage({ currentUser }: M5UDetailPageProps) {
  const navigate = useNavigate();
  const { bulan, tahun } = useParams<{ bulan: string; tahun: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Omit<M5U, 'id'>>({
    bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: '', waktuPelaksanaan: '', statusHasil: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { m5uItems, loading, addM5U, updateM5U, deleteM5U } = useM5U(currentUser);

  const filteredM5UItems = useMemo(() => {
    return m5uItems.filter(item => 
      item.bulan === bulan && 
      item.tahun === Number(tahun)
    );
  }, [m5uItems, bulan, tahun]);

  const openDialog = (item?: M5U) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({
        bulan: bulan || '', tahun: Number(tahun) || new Date().getFullYear(), agenda: '', hasil: '', pj: currentUser?.name || '', waktuPelaksanaan: '', statusHasil: ''
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
      const itemWithMetadata = {
        ...currentItem,
        desa: currentUser?.desa || '',
        kelompok: currentUser?.kelompok || '',
        guruId: currentUser?.role === 'guru' ? (currentUser.id || '') : ''
      };
      success = await addM5U(itemWithMetadata);
    }
    
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteM5U(id);
  };

  const handleStatusChange = async (id: string, newStatus: M5U['statusHasil']) => {
    const itemToUpdate = filteredM5UItems.find(item => item.id === id);
    if (!itemToUpdate) {
      return;
    }

    if (currentUser?.role === 'guru' && itemToUpdate.guruId !== currentUser.id) {
      return;
    }

    await updateM5U(id, { ...itemToUpdate, statusHasil: newStatus });
  };

  const handlePrintPDF = () => {
    generateM5UPDF(filteredM5UItems, currentUser, bulan, tahun);
  };

  const handleChange = (field: keyof Omit<M5U, 'id'>, value: string | number) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const canAdd = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';
  const canUpdate = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok' || currentUser?.role === 'guru';
  const canDelete = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin' || currentUser?.role === 'desa' || currentUser?.role === 'kelompok';

  if (loading) {
    return <div className="p-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="p-6">
      <M5UHeader onBack={() => navigate(-1)} onPrint={handlePrintPDF} />
      
      <M5UInfo bulan={bulan} tahun={tahun} canAdd={canAdd} onAdd={() => openDialog()} />
      
      <M5UTable
        items={filteredM5UItems}
        canUpdate={canUpdate}
        canDelete={canDelete}
        currentUser={currentUser}
        onEdit={openDialog}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
      
      {canAdd && (
        <M5UFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isEditMode={isEditMode}
          currentItem={currentItem}
          onInputChange={handleChange}
          onSave={handleSave}
        />
      )}
    </div>
  );
}