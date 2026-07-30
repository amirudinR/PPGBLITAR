import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Role, ROLES } from '@/types/admin';
import { useSort } from './useSort';
import { usePagination } from './usePagination';
import { useSelection } from './useSelection';
import {
  ROLE_LABELS,
  getStatusVariant,
  getCreatableRoles,
  canResetPassword,
  filterUsersByRoleHierarchy,
} from '@/utils/roleHelpers';

const ITEMS_PER_PAGE = 10;

export function useAccounts(
  users: User[],
  currentUser: User | null,
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>,
  onAddUsersBatch: (users: Omit<User, 'id'>[]) => Promise<boolean>,
  onUpdateUser: (id: string, data: Omit<User, 'id'>) => Promise<boolean>,
  onDeleteUser: (id: string) => void,
  onResetUserPassword: (email: string) => Promise<void>,
) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: '',
  });
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  /* ---------- role hierarchy filtering ---------- */
  const filteredUsers = useMemo(() => filterUsersByRoleHierarchy(users, currentUser), [users, currentUser]);

  /* ---------- sorting ---------- */
  const { sortedItems: sortedUsers, requestSort, getSortIndicator } = useSort(filteredUsers);

  /* ---------- pagination ---------- */
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedUsers,
  } = usePagination(sortedUsers, ITEMS_PER_PAGE);

  /* ---------- selection ---------- */
  const selectableUsers = useMemo(
    () => {
      if (currentUser?.role === 'adminsuper') {
        return paginatedUsers;
      }
      return paginatedUsers.filter((u) => u.role !== 'guru' && u.id !== currentUser?.id);
    },
    [paginatedUsers, currentUser],
  );

  const {
    selectedIds,
    allPageSelected,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
  } = useSelection(selectableUsers);

  /* ---------- bulk delete ---------- */
  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await onDeleteUser(id);
    }
    clearSelection();
    setIsBulkDeleteOpen(false);
  }, [selectedIds, onDeleteUser, clearSelection]);

  /* ---------- add user ---------- */
  useEffect(() => {
    if (currentUser?.role === 'desa') {
      setNewUser((prev) => ({ ...prev, desa: currentUser.desa }));
    } else if (currentUser?.role === 'kelompok') {
      setNewUser((prev) => ({ ...prev, desa: currentUser.desa, kelompok: currentUser.kelompok }));
    }
  }, [currentUser]);

  const handleAdd = useCallback(async () => {
    const ok = await onAddUser(newUser);
    if (ok) {
      setIsAddOpen(false);
      setNewUser({ name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: '' });
    }
  }, [newUser, onAddUser]);

  const handleRoleChange = useCallback(
    (role: Role) => {
      setNewUser((prev) => ({
        ...prev,
        role,
        desa:
          currentUser?.role === 'desa'
            ? currentUser.desa
            : currentUser?.role === 'kelompok'
            ? currentUser.desa
            : '',
        kelompok: currentUser?.role === 'kelompok' ? currentUser.kelompok : '',
      }));
    },
    [currentUser],
  );

  /* ---------- edit user ---------- */
  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingUser) return false;
    const { id, ...data } = editingUser;
    const ok = await onUpdateUser(id, data);
    if (ok) {
      setIsEditOpen(false);
      setEditingUser(null);
    }
    return ok;
  }, [editingUser, onUpdateUser]);

  return {
    // pagination
    paginatedUsers,
    currentPage,
    setCurrentPage,
    totalPages,
    sortedUsers,
    ITEMS_PER_PAGE,

    // sorting
    requestSort,
    getSortIndicator,

    // selection
    selectedIds,
    allPageSelected,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,

    // bulk delete
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    handleBulkDelete,

    // bulk add dialog
    isBulkAddOpen,
    setIsBulkAddOpen,
    onAddUsersBatch,

    // add dialog
    isAddOpen,
    setIsAddOpen,
    newUser,
    setNewUser,
    handleAdd,
    handleRoleChange,

    // edit dialog
    isEditOpen,
    setIsEditOpen,
    editingUser,
    setEditingUser,
    openEdit,
    handleUpdate,

    // role helpers
    creatableRoles: getCreatableRoles(currentUser?.role),
    canResetPassword: (target: User) => canResetPassword(currentUser, target),

    // password reset
    onResetUserPassword,
  };
}
