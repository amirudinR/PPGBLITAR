import React from 'react';
import { User, Desa, Kelompok } from '@/types/admin';
import { useAccounts } from '@/hooks/useAccounts';
import SectionHeader from '../shared/SectionHeader';
import AccountsTable from './AccountsTable';
import AddUserDialog from './AddUserDialog';
import BulkAddUserDialog from './BulkAddUserDialog';
import EditUserDialog from './EditUserDialog';
import BulkDeleteBar from './BulkDeleteBar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface AccountsSectionProps {
  users: User[];
  desas: Desa[];
  kelompok: Kelompok[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  onAddUsersBatch: (users: Omit<User, 'id'>[]) => Promise<boolean>;
  onUpdateUser: (id: string, updatedData: Omit<User, 'id'>) => Promise<boolean>;
  onDeleteUser: (id: string) => void;
  onResetUserPassword: (email: string) => Promise<void>;
  currentUser: User | null;
}

export default function AccountsSection({
  users, desas, kelompok, onAddUser, onAddUsersBatch, onUpdateUser, onDeleteUser,
  onResetUserPassword, currentUser,
}: AccountsSectionProps) {
  const a = useAccounts(
    users, currentUser,
    onAddUser, onAddUsersBatch, onUpdateUser, onDeleteUser, onResetUserPassword,
  );

  return (
    <div>
      <SectionHeader
        title="Daftar Akun Pengguna"
        subtitle="Kelola akun berdasarkan peran, desa, dan kelompok."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => a.setIsBulkAddOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <BulkAddUserDialog
              open={a.isBulkAddOpen}
              setOpen={a.setIsBulkAddOpen}
              onImport={a.onAddUsersBatch}
              desas={desas}
              kelompok={kelompok}
              currentUser={currentUser}
            />
            <AddUserDialog
              open={a.isAddOpen}
              setOpen={a.setIsAddOpen}
              user={a.newUser}
              setUser={a.setNewUser}
              onSave={a.handleAdd}
              onRoleChange={a.handleRoleChange}
              creatableRoles={a.creatableRoles}
              desas={desas}
              kelompok={kelompok}
              currentUser={currentUser}
            />
          </div>
        }
      />

      <BulkDeleteBar
        selectedCount={a.selectedIds.size}
        isOpen={a.isBulkDeleteOpen}
        setOpen={a.setIsBulkDeleteOpen}
        onDelete={a.handleBulkDelete}
        onClear={a.clearSelection}
      />

      <AccountsTable
        users={a.paginatedUsers}
        currentUser={currentUser}
        selectedIds={a.selectedIds}
        allPageSelected={a.allPageSelected}
        toggleSelectAll={a.toggleSelectAll}
        toggleSelectOne={a.toggleSelectOne}
        onEdit={a.openEdit}
        onDelete={onDeleteUser}
        currentPage={a.currentPage}
        totalPages={a.totalPages}
        totalItems={a.sortedUsers.length}
        itemsPerPage={a.ITEMS_PER_PAGE}
        onPageChange={a.setCurrentPage}
        requestSort={a.requestSort}
        getSortIndicator={a.getSortIndicator}
      />

      <EditUserDialog
        open={a.isEditOpen}
        setOpen={a.setIsEditOpen}
        user={a.editingUser}
        setUser={a.setEditingUser}
        onSave={a.handleUpdate}
        creatableRoles={a.creatableRoles}
        canResetPassword={a.canResetPassword}
        onResetPassword={onResetUserPassword}
      />
    </div>
  );
}