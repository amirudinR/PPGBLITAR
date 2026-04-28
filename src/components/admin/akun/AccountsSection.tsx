import React, { useState, useEffect, useMemo } from 'react';
import { User, Desa, Kelompok, ROLES, Role } from '@/types/admin';
import { Edit, Trash2, Plus, CheckSquare, KeyRound } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PaginationControls from '../layout/PaginationControls';
import SectionHeader from '../shared/SectionHeader';
import StatusBadge from '../shared/StatusBadge';

interface AccountsSectionProps {
  users: User[];
  desas: Desa[];
  kelompok: Kelompok[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  onUpdateUser: (id: string, updatedData: Omit<User, 'id'>) => Promise<boolean>;
  onDeleteUser: (id: string) => void;
  onResetUserPassword: (email: string) => Promise<void>;
  currentUser: User | null;
}

const ITEMS_PER_PAGE = 10;

const getStatusVariant = (status: string): 'success' | 'muted' => {
  switch (status) {
    case 'Active':
      return 'success';
    default:
      return 'muted';
  }
};

const ROLE_LABELS: Record<Role, string> = {
  adminsuper: 'Admin Super',
  admin: 'Admin',
  desa: 'PJP Desa',
  kelompok: 'PJP Kelompok',
  guru: 'Guru',
  orangtua: 'Orang Tua'
};

export default function AccountsSection({ users, desas, kelompok, onAddUser, onUpdateUser, onDeleteUser, onResetUserPassword, currentUser }: AccountsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const sortedUsers = useMemo(() => {
    const sortableItems = [...users];
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
  }, [users, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);

  const selectableUsers = useMemo(
    () => paginatedUsers.filter(u => u.role !== 'guru' && u.id !== currentUser?.id),
    [paginatedUsers, currentUser]
  );

  const allPageSelected =
    selectableUsers.length > 0 && selectableUsers.every(u => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const next = new Set(selectedIds);
      selectableUsers.forEach(u => next.delete(u.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      selectableUsers.forEach(u => next.add(u.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await onDeleteUser(id);
    }
    setSelectedIds(new Set());
    setIsBulkDeleteOpen(false);
  };

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIndicator = (key: keyof User) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  useEffect(() => {
    if (currentUser?.role === 'desa') {
      setNewUser(prev => ({ ...prev, desa: currentUser.desa }));
    } else if (currentUser?.role === 'kelompok') {
      setNewUser(prev => ({ ...prev, desa: currentUser.desa, kelompok: currentUser.kelompok }));
    }
  }, [currentUser]);

  const handleSave = async () => {
    const success = await onAddUser(newUser);
    if (success) {
      setIsAddDialogOpen(false);
      setNewUser({ name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: '' });
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const { id, ...updatedData } = editingUser;
    const success = await onUpdateUser(id, updatedData);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (role: Role) => {
    setNewUser(prev => ({
      ...prev,
      role,
      desa: currentUser?.role === 'desa' ? currentUser.desa : (currentUser?.role === 'kelompok' ? currentUser.desa : ''),
      kelompok: currentUser?.role === 'kelompok' ? currentUser.kelompok : ''
    }));
  };

  const creatableRoles = () => {
    if (currentUser?.role === 'desa') {
      return ROLES.filter(r => ['kelompok', 'guru', 'orangtua'].includes(r));
    }
    if (currentUser?.role === 'kelompok') {
      return ROLES.filter(r => ['guru', 'orangtua'].includes(r));
    }
    if (currentUser?.role === 'admin') {
      return ROLES.filter(r => r !== 'adminsuper');
    }
    return ROLES;
  };

  return (
    <div>
      <SectionHeader
        title="Daftar Akun Pengguna"
        subtitle="Kelola akun berdasarkan peran, desa, dan kelompok."
        action={currentUser?.role !== 'kelompok' ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                <span>Tambah Akun</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Akun Baru</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label>Peran</Label>
                  <Select value={newUser.role} onValueChange={(value) => handleRoleChange(value as Role)}>
                    <SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                    <SelectContent>{creatableRoles().map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {['desa', 'kelompok', 'guru', 'orangtua'].includes(newUser.role) && (
                  <div>
                    <Label>Desa</Label>
                    <Select 
                      value={newUser.desa} 
                      onValueChange={desa => setNewUser({...newUser, desa, kelompok: ''})}
                      disabled={currentUser?.role === 'desa'}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih Desa" /></SelectTrigger>
                      <SelectContent>{desas.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}

                {['kelompok', 'guru', 'orangtua'].includes(newUser.role) && (
                  <div>
                    <Label>Kelompok</Label>
                    <Select 
                      value={newUser.kelompok} 
                      onValueChange={kelompok => setNewUser({...newUser, kelompok})}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih Kelompok" /></SelectTrigger>
                      <SelectContent>{kelompok.filter(k => k.desaName === newUser.desa).map(k => <SelectItem key={k.id} value={k.name}>{k.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <Label>Nama</Label>
                  <Input placeholder="Nama Lengkap" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      />
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm text-muted-foreground">{selectedIds.size} akun dipilih</span>
          <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Terpilih
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus {selectedIds.size} akun?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus {selectedIds.size} akun secara permanen dan tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Hapus Semua</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Batalkan Pilihan
          </Button>
        </div>
      )}
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
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('name')}
              >
                Nama{getSortIndicator('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('email')}
              >
                Email{getSortIndicator('email')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('role')}
              >
                Peran{getSortIndicator('role')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('status')}
              >
                Status{getSortIndicator('status')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('desa' as keyof User)}
              >
                Desa{getSortIndicator('desa' as keyof User)}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => requestSort('kelompok' as keyof User)}
              >
                Kelompok{getSortIndicator('kelompok' as keyof User)}
              </TableHead>
              <TableHead>Password</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => {
              const isSelectable = user.role !== 'guru' && user.id !== currentUser?.id;
              return (
              <TableRow key={user.id} data-state={selectedIds.has(user.id) ? 'selected' : undefined}>
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
                  <StatusBadge label={user.status} variant={getStatusVariant(user.status)} />
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
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} aria-label={`Edit akun ${user.name}`}>
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
                            <AlertDialogAction onClick={() => onDeleteUser(user.id)}>Hapus</AlertDialogAction>
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
          totalItems={sortedUsers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Akun</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="py-4 space-y-4">
              <div>
                <Label>Peran</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({...editingUser, role: value as Role})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{creatableRoles().map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nama</Label>
                <Input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onResetUserPassword(editingUser.email)}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Kirim Email Reset Password
                </Button>
                <p className="text-xs text-muted-foreground">Tautan reset akan dikirim ke email pengguna.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}