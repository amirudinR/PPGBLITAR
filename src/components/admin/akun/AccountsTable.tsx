import React from 'react';
import { User, Role } from '@/types/admin';
import { Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PaginationControls from '../layout/PaginationControls';
import StatusBadge from '../shared/StatusBadge';
import { getStatusVariant, ROLE_LABELS } from '@/hooks/useAccounts';

interface Props {
  users: User[];
  currentUser: User | null;
  selectedIds: Set<string>;
  allPageSelected: boolean;
  toggleSelectAll: () => void;
  toggleSelectOne: (id: string) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  requestSort: (key: keyof User) => void;
  getSortIndicator: (key: keyof User) => string | null;
}

export default function AccountsTable({
  users,
  currentUser,
  selectedIds,
  allPageSelected,
  toggleSelectAll,
  toggleSelectOne,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  requestSort,
  getSortIndicator,
}: Props) {
  return (
    <div className="bg-card rounded-lg shadow overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allPageSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Tandai semua"
              />
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('name')}>
              Nama{getSortIndicator('name')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('email')}>
              Email{getSortIndicator('email')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('role')}>
              Peran{getSortIndicator('role')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('status')}>
              Status{getSortIndicator('status')}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('desa' as keyof User)}>
              Desa{getSortIndicator('desa' as keyof User)}
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => requestSort('kelompok' as keyof User)}>
              Kelompok{getSortIndicator('kelompok' as keyof User)}
            </TableHead>
            <TableHead>Password</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelectable = user.role !== 'guru' && user.id !== currentUser?.id;
            return (
              <TableRow
                key={user.id}
                data-state={selectedIds.has(user.id) ? 'selected' : undefined}
              >
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={() => toggleSelectOne(user.id)}
                    disabled={!isSelectable}
                    aria-label={`Pilih ${user.name}`}
                  />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={user.status}
                    variant={getStatusVariant(user.status)}
                  />
                </TableCell>
                <TableCell>{user.desa || '-'}</TableCell>
                <TableCell>{user.kelompok || '-'}</TableCell>
                <TableCell>{user.password || '******'}</TableCell>
                <TableCell className="text-center">
                  {user.role === 'guru' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button variant="ghost" size="icon" disabled aria-label="Edit akun dinonaktifkan untuk role guru">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled aria-label="Hapus akun dinonaktifkan untuk role guru">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit atau hapus di halaman data guru</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(user)} aria-label={`Edit akun ${user.name}`}>
                        <Edit className="w-4 h-4 text-[hsl(var(--info))]" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Hapus akun ${user.name}`}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus data akun secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(user.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
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
