import React, { useState, useEffect } from 'react';
import { User, Desa, Kelompok, ROLES, Role } from '@/types/admin';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AccountsSectionProps {
  users: User[];
  desas: Desa[];
  kelompok: Kelompok[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  onUpdateUser: (id: string, updatedData: Omit<User, 'id'>) => Promise<boolean>;
  onDeleteUser: (id: string) => void;
  currentUser: User | null;
}

const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

export default function AccountsSection({ users, desas, kelompok, onAddUser, onUpdateUser, onDeleteUser, currentUser }: AccountsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: ''
  });

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Daftar Akun Pengguna</h2>
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

              {currentUser?.role !== 'kelompok' && ['desa', 'kelompok', 'guru', 'orangtua'].includes(newUser.role) && (
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

              {currentUser?.role !== 'kelompok' && ['kelompok', 'guru', 'orangtua'].includes(newUser.role) && (
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
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Kelompok</TableHead>
              <TableHead>Password</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>{user.desa || '-'}</TableCell>
                <TableCell>{user.kelompok || '-'}</TableCell>
                <TableCell>{user.password || '******'}</TableCell>
                <TableCell className="text-center">
                  {user.role === 'guru' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit atau hapus di halaman data guru</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
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
            ))}
          </TableBody>
        </Table>
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
              <div>
                <Label>Password (Kosongkan jika tidak ingin mengubah)</Label>
                <Input type="password" onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
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