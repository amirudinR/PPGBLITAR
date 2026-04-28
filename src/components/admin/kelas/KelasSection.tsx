import React, { useState, useMemo } from 'react';
import { Kelas, Guru, User, JenjangUsia, Generus, getJenjangUsia, Desa, Kelompok } from '@/types/admin';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '../shared/SectionHeader';
import KelasTable from './KelasTable';
import KelasFormDialog from './KelasFormDialog';
import ManageStudentsDialog from './ManageStudentsDialog';

interface KelasSectionProps {
  kelas: Kelas[];
  gurus: Guru[];
  generus: Generus[];
  onAddKelas: (kelasData: Omit<Kelas, 'id'>) => Promise<boolean>;
  onUpdateKelas: (id: string, kelasData: Omit<Kelas, 'id'>) => Promise<boolean>;
  onDeleteKelas: (id: string) => void;
  currentUser: User | null;
  desas: Desa[];
  kelompok: Kelompok[];
}

const ITEMS_PER_PAGE = 10;

export default function KelasSection({ kelas, gurus, generus, onAddKelas, onUpdateKelas, onDeleteKelas, currentUser, desas, kelompok }: KelasSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Omit<Kelas, 'id'>>>({
    namaKelas: '', guruId: '', guruName: '', jenjangUsia: 'Caberawit', desa: '', kelompok: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manageStudentsDialogOpen, setManageStudentsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Kelas | null>(null);
  const [studentToAdd, setStudentToAdd] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Kelas; direction: 'asc' | 'desc' } | null>(null);

  const isAdmin = currentUser?.role === 'adminsuper' || currentUser?.role === 'admin';

  const sortedKelas = useMemo(() => {
    const sortableItems = [...kelas];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [kelas, sortConfig]);

  const paginatedKelas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedKelas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedKelas, currentPage]);

  const totalPages = Math.ceil(sortedKelas.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Kelas) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const openDialog = (item?: Kelas) => {
    if (item) {
      setIsEditMode(true);
      setCurrentItem(item);
      setEditingId(item.id);
    } else {
      setIsEditMode(false);
      setCurrentItem({ 
        namaKelas: '', 
        guruId: '', 
        guruName: '', 
        jenjangUsia: 'Caberawit',
        desa: isAdmin ? '' : currentUser?.desa || '',
        kelompok: isAdmin ? '' : currentUser?.kelompok || '',
      });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const finalItem = { ...currentItem, studentIds: currentItem.studentIds || [] };

    let success = false;
    if (isEditMode && editingId) {
      success = await onUpdateKelas(editingId, finalItem as Omit<Kelas, 'id'>);
    } else {
      success = await onAddKelas(finalItem as Omit<Kelas, 'id'>);
    }
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteKelas(id);
  };

  const handleGuruChange = (guruId: string) => {
    const selectedGuru = gurus.find(g => g.id === guruId);
    setCurrentItem(prev => ({ ...prev, guruId, guruName: selectedGuru?.name || '' }));
  };

  const availableGurus = useMemo(() => {
    if (isAdmin) {
      if (!currentItem.kelompok) return [];
      return gurus.filter(g => g.kelompok === currentItem.kelompok);
    }
    if (currentUser?.role === 'desa') {
      return gurus.filter(g => g.desa === currentUser.desa);
    }
    if (currentUser?.role === 'kelompok') {
      return gurus.filter(g => g.desa === currentUser.desa && g.kelompok === currentUser.kelompok);
    }
    return gurus;
  }, [gurus, currentUser, isAdmin, currentItem.kelompok]);

  const filteredKelompok = useMemo(() => {
    if (!currentItem.desa) return [];
    return kelompok.filter(k => k.desaName === currentItem.desa);
  }, [currentItem.desa, kelompok]);

  const openManageStudentsDialog = (k: Kelas) => {
    setSelectedClass(k);
    setManageStudentsDialogOpen(true);
  };

  const allEnrolledStudentIds = useMemo(() => {
    const studentIdSet = new Set<string>();
    kelas.forEach(k => {
      if (k.studentIds) {
        k.studentIds.forEach(id => studentIdSet.add(id));
      }
    });
    return studentIdSet;
  }, [kelas]);

  const availableStudents = useMemo(() => {
    if (!selectedClass) return [];
    return generus.filter(g => {
        const generusJenjang = getJenjangUsia(g.pendidikan);
        return generusJenjang === selectedClass.jenjangUsia && !allEnrolledStudentIds.has(g.id);
    });
  }, [generus, selectedClass, allEnrolledStudentIds]);

  const enrolledStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classStudentIds = selectedClass.studentIds || [];
    return generus.filter(g => classStudentIds.includes(g.id));
  }, [generus, selectedClass]);

  const handleAddStudent = async () => {
    if (!studentToAdd || !selectedClass) return;
    const currentStudentIds = selectedClass.studentIds || [];
    const newStudentIds = [...currentStudentIds, studentToAdd];
    const { id, ...classData } = selectedClass;
    const updatedClass = { ...classData, studentIds: newStudentIds };
    
    const success = await onUpdateKelas(id, updatedClass);
    if (success) {
        setSelectedClass(prev => prev ? { ...prev, studentIds: newStudentIds } : null);
        setStudentToAdd('');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;
    const currentStudentIds = selectedClass.studentIds || [];
    const newStudentIds = currentStudentIds.filter(id => id !== studentId);
    const { id, ...classData } = selectedClass;
    const updatedClass = { ...classData, studentIds: newStudentIds };

    const success = await onUpdateKelas(id, updatedClass);
    if (success) {
        setSelectedClass(prev => prev ? { ...prev, studentIds: newStudentIds } : null);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Data Kelas"
        subtitle="Kelola kelas, pengajar, dan distribusi siswa per jenjang usia."
        action={
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kelas
          </Button>
        }
      />
      <KelasTable
        kelas={paginatedKelas}
        isAdmin={isAdmin}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedKelas.length}
        itemsPerPage={ITEMS_PER_PAGE}
        sortConfig={sortConfig}
        onSort={requestSort}
        onPageChange={setCurrentPage}
        onManageStudents={openManageStudentsDialog}
        onEdit={openDialog}
        onDelete={handleDelete}
      />

      <KelasFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        isEditMode={isEditMode}
        formData={currentItem as any}
        onFormDataChange={setCurrentItem as any}
        onGuruChange={handleGuruChange}
        availableGurus={availableGurus}
        desas={desas}
        filteredKelompok={filteredKelompok}
        isAdmin={isAdmin}
      />

      <ManageStudentsDialog
        isOpen={manageStudentsDialogOpen}
        onClose={() => setManageStudentsDialogOpen(false)}
        selectedClass={selectedClass}
        availableStudents={availableStudents}
        enrolledStudents={enrolledStudents}
        studentToAdd={studentToAdd}
        onStudentToAddChange={setStudentToAdd}
        onAddStudent={handleAddStudent}
        onRemoveStudent={handleRemoveStudent}
      />
    </div>
  );
}