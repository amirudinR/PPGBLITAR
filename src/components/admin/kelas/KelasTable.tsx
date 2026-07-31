import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Edit, Trash2 } from 'lucide-react';
import { Kelas } from '@/types/admin';
import PaginationControls from '../layout/PaginationControls';

interface KelasTableProps {
  kelas: Kelas[];
  isAdmin: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  sortConfig: { key: keyof Kelas; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof Kelas) => void;
  onPageChange: (page: number) => void;
  onManageStudents: (kelas: Kelas) => void;
  onEdit: (kelas: Kelas) => void;
  onDelete: (id: string) => void;
}

const getSortIndicator = (sortConfig: { key: keyof Kelas; direction: 'asc' | 'desc' } | null, key: keyof Kelas) => {
  if (!sortConfig || sortConfig.key !== key) return null;
  return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
};

export default function KelasTable({
  kelas,
  isAdmin,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  sortConfig,
  onSort,
  onPageChange,
  onManageStudents,
  onEdit,
  onDelete
}: KelasTableProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => onSort('namaKelas')}
            >
              Nama Kelas{getSortIndicator(sortConfig, 'namaKelas')}
            </TableHead>
            {isAdmin && (
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSort('desa' as keyof Kelas)}
              >
                Desa{getSortIndicator(sortConfig, 'desa' as keyof Kelas)}
              </TableHead>
            )}
            {isAdmin && (
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => onSort('kelompok' as keyof Kelas)}
              >
                Kelompok{getSortIndicator(sortConfig, 'kelompok' as keyof Kelas)}
              </TableHead>
            )}
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => onSort('guruName' as keyof Kelas)}
            >
              Guru{getSortIndicator(sortConfig, 'guruName' as keyof Kelas)}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => onSort('jenjangUsia' as keyof Kelas)}
            >
              Jenjang Usia{getSortIndicator(sortConfig, 'jenjangUsia' as keyof Kelas)}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted"
              onClick={() => onSort('studentIds' as keyof Kelas)}
            >
              Jumlah Siswa{getSortIndicator(sortConfig, 'studentIds' as keyof Kelas)}
            </TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kelas.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.namaKelas}</TableCell>
              {isAdmin && <TableCell>{item.desa}</TableCell>}
              {isAdmin && <TableCell>{item.kelompok}</TableCell>}
              <TableCell>{item.guruName}</TableCell>
              <TableCell>{item.jenjangUsia}</TableCell>
              <TableCell>{(item.studentIds || []).length}</TableCell>
              <TableCell className="text-center space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onManageStudents(item)} aria-label={`Kelola siswa kelas ${item.namaKelas}`}><Users className="w-4 h-4 text-[hsl(var(--success))]" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={`Edit kelas ${item.namaKelas}`}><Edit className="w-4 h-4 text-[hsl(var(--info))]" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Hapus kelas ${item.namaKelas}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
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
                      <AlertDialogAction onClick={() => onDelete(item.id)}>Hapus</AlertDialogAction>
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
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
