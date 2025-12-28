import React, { useState, useMemo } from 'react';
import { Desa } from '@/types/admin';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginationControls from './PaginationControls';

interface DesaSectionProps {
  desas: Desa[];
  onAddDesa: (name: string) => Promise<boolean>;
  onUpdateDesa: (id: string, newName: string) => Promise<boolean>;
  onDeleteDesa: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function DesaSection({ desas, onAddDesa, onUpdateDesa, onDeleteDesa }: DesaSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDesaName, setNewDesaName] = useState('');
  const [editingDesa, setEditingDesa] = useState<Desa | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Desa; direction: 'asc' | 'desc' } | null>(null);

  const sortedDesas = useMemo(() => {
    let sortableItems = [...desas];
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
  }, [desas, sortConfig]);

  const paginatedDesas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedDesas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedDesas, currentPage]);

  const totalPages = Math.ceil(sortedDesas.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Desa) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIndicator = (key: keyof Desa) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const handleAdd = async () => {
    const success = await onAddDesa(newDesaName);
    if (success) {
      setNewDesaName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = async () => {
    if (editingDesa && newDesaName) {
      const success = await onUpdateDesa(editingDesa.id, newDesaName);
      if (success) {
        setEditingDesa(null);
        setNewDesaName('');
        setIsEditDialogOpen(false);
      }
    }
  };

  const openEditDialog = (desa: Desa) => {
    setEditingDesa(desa);
    setNewDesaName(desa.name);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeleteDesa(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Desa</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              <span>Tambah Desa</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Desa Baru</DialogTitle>
              <DialogDescription>Masukkan nama desa yang ingin ditambahkan.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="desaName">Nama Desa</Label>
              <Input 
                id="desaName" 
                value={newDesaName} 
                onChange={(e) => setNewDesaName(e.target.value)} 
                className="mt-1"
                placeholder="Contoh: Desa Sejahtera"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAdd}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-card rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('name')}
              >
                Nama Desa{getSortIndicator('name')}
              </TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDesas.map((desa) => (
              <TableRow key={desa.id}>
                <TableCell>{desa.name}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(desa)}>
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
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
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data desa secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(desa.id)}>Hapus</AlertDialogAction>
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
          totalItems={sortedDesas.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Nama Desa</DialogTitle>
            <DialogDescription>Perbarui nama desa yang sudah ada.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="editDesaName">Nama Desa</Label>
            <Input 
              id="editDesaName" 
              value={newDesaName} 
              onChange={(e) => setNewDesaName(e.target.value)} 
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEdit}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}