import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { M5U, User } from '@/types/admin';

interface M5UTableProps {
  items: M5U[];
  canUpdate: boolean;
  canDelete: boolean;
  currentUser: User | null;
  onEdit: (item: M5U) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: M5U['statusHasil']) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

export default function M5UTable({
  items,
  canUpdate,
  canDelete,
  currentUser,
  onEdit,
  onDelete,
  onStatusChange
}: M5UTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agenda</TableHead>
            <TableHead>Hasil</TableHead>
            <TableHead>PJ</TableHead>
            <TableHead>Tanggal Pelaksanaan</TableHead>
            <TableHead>Status</TableHead>
            {canUpdate || canDelete ? <TableHead className="text-center">Aksi</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.agenda}</TableCell>
              <TableCell>{item.hasil || '-'}</TableCell>
              <TableCell>{item.pj}</TableCell>
              <TableCell>{formatDate(item.waktuPelaksanaan)}</TableCell>
              <TableCell>
                {canUpdate && (currentUser?.role !== 'guru' || item.guruId === currentUser?.id) ? (
                  <Select
                    value={item.statusHasil || ''}
                    onValueChange={(value) => onStatusChange(item.id, value as M5U['statusHasil'])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Terlaksana">Terlaksana</SelectItem>
                      <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                      <SelectItem value="Belum Terlaksana">Belum Terlaksana</SelectItem>
                      <SelectItem value="Mansuh">Mansuh</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.statusHasil === 'Terlaksana'
                      ? 'bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]'
                      : item.statusHasil === 'Dalam Proses'
                        ? 'bg-[hsl(var(--info)/0.2)] text-[hsl(var(--info))]'
                        : item.statusHasil === 'Belum Terlaksana'
                          ? 'bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]'
                          : item.statusHasil === 'Mansuh'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-muted text-foreground'
                  }`}>
                    {item.statusHasil || '-'}
                  </span>
                )}
              </TableCell>
              {canUpdate || canDelete ? (
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    {canUpdate ? (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label={`Edit agenda ${item.agenda}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Hapus agenda ${item.agenda}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus agenda ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(item.id)}>
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
