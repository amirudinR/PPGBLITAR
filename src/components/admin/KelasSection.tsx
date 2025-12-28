import React, { useState, useMemo } from 'react';
import { Kelas, Guru, User, JENJANG_USIA_LIST, JenjangUsia, Generus, getJenjangUsia, Desa, Kelompok } from '@/types/admin';
import { Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import PaginationControls from './PaginationControls';

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
    let sortableItems = [...kelas];
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

  const getSortIndicator = (key: keyof Kelas) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Kelas</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>
      <div className="bg-card rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('namaKelas')}
              >
                Nama Kelas{getSortIndicator('namaKelas')}
              </TableHead>
              {isAdmin && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => requestSort('desa' as keyof Kelas)}
                >
                  Desa{getSortIndicator('desa' as keyof Kelas)}
                </TableHead>
              )}
              {isAdmin && (
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => requestSort('kelompok' as keyof Kelas)}
                >
                  Kelompok{getSortIndicator('kelompok' as keyof Kelas)}
                </TableHead>
              )}
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('guruName' as keyof Kelas)}
              >
                Guru{getSortIndicator('guruName' as keyof Kelas)}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('jenjangUsia' as keyof Kelas)}
              >
                Jenjang Usia{getSortIndicator('jenjangUsia' as keyof Kelas)}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('studentIds' as keyof Kelas)}
              >
                Jumlah Siswa{getSortIndicator('studentIds' as keyof Kelas)}
              </TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKelas.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.namaKelas}</TableCell>
                {isAdmin && <TableCell>{item.desa}</TableCell>}
                {isAdmin && <TableCell>{item.kelompok}</TableCell>}
                <TableCell>{item.guruName}</TableCell>
                <TableCell>{item.jenjangUsia}</TableCell>
                <TableCell>{(item.studentIds || []).length}</TableCell>
                <TableCell className="text-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openManageStudentsDialog(item)}><Users className="w-4 h-4 text-green-600" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini akan menghapus data kelas secara permanen. Data kehadiran individu generus tidak akan terpengaruh.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedKelas.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isAdmin && (
              <>
                <div>
                  <Label>Desa</Label>
                  <Select 
                    value={currentItem.desa} 
                    onValueChange={desa => setCurrentItem(prev => ({ ...prev, desa, kelompok: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Desa" />
                    </SelectTrigger>
                    <SelectContent>
                      {desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kelompok</Label>
                  <Select 
                    value={currentItem.kelompok} 
                    onValueChange={kelompok => setCurrentItem(prev => ({ ...prev, kelompok }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelompok" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredKelompok.map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div>
              <Label>Nama Kelas</Label>
              <Input 
                value={currentItem.namaKelas} 
                onChange={(e) => setCurrentItem(prev => ({ ...prev, namaKelas: e.target.value }))} 
              />
            </div>
            <div>
              <Label>Guru</Label>
              <Select 
                value={currentItem.guruId} 
                onValueChange={handleGuruChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  {availableGurus.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jenjang Usia</Label>
              <Select 
                value={currentItem.jenjangUsia} 
                onValueChange={(value) => setCurrentItem(prev => ({ ...prev, jenjangUsia: value as JenjangUsia }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenjang Usia" />
                </SelectTrigger>
                <SelectContent>
                  {JENJANG_USIA_LIST.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageStudentsDialogOpen} onOpenChange={setManageStudentsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Siswa di Kelas {selectedClass?.namaKelas}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <Label className="text-lg font-semibold">Tambah Siswa</Label>
              <div className="flex items-center gap-2 mt-2">
                <Select 
                  value={studentToAdd} 
                  onValueChange={setStudentToAdd}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Generus..." />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {availableStudents.map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name} ({g.pendidikan})
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddStudent} disabled={!studentToAdd}>Tambah</Button>
              </div>
            </div>
            <div>
              <Label className="text-lg font-semibold">Siswa Terdaftar ({enrolledStudents.length})</Label>
              <ScrollArea className="h-64 mt-2 rounded-md border p-2">
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 hover:bg-background rounded">
                      <div>
                        <span className="font-medium">{student.name}</span>
                        <Badge variant="outline" className="ml-2 font-normal">{student.pendidikan}</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Belum ada siswa di kelas ini.</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}