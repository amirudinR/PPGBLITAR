import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Role, ROLES } from '@/types/admin';

const ITEMS_PER_PAGE = 10;

export const ROLE_LABELS: Record<Role, string> = {
  adminsuper: 'Admin Super',
  admin: 'Admin',
  desa: 'PJP Desa',
  kelompok: 'PJP Kelompok',
  guru: 'Guru',
  orangtua: 'Orang Tua',
};

export function getStatusVariant(status: string): 'success' | 'muted' {
  return status === 'Active' ? 'success' : 'muted';
}

export function useAccounts(
  users: User[],
  currentUser: User | null,
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>,
  onUpdateUser: (id: string, data: Omit<User, 'id'>) => Promise<boolean>,
  onDeleteUser: (id: string) => void,
  onResetUserPassword: (email: string) => Promise<void>,
) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '', email: '', role: 'guru', status: 'Active', desa: '', kelompok: '', password: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  /* ---------- sorting & pagination ---------- */
  const sortedUsers = useMemo(() => {
    const items = [...users];
    if (sortConfig) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [users, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);

  const selectableUsers = useMemo(
    () => paginatedUsers.filter((u) => u.role !== 'guru' && u.id !== currentUser?.id),
    [paginatedUsers, currentUser],
  );

  const allPageSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));

  /* ---------- selection ---------- */
  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        selectableUsers.forEach((u) => next.delete(u.id));
      } else {
        selectableUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  }, [allPageSelected, selectableUsers]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  /* ---------- bulk delete ---------- */
  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await onDeleteUser(id);
    }
    clearSelection();
    setIsBulkDeleteOpen(false);
  }, [selectedIds, onDeleteUser, clearSelection]);

  /* ---------- sorting ---------- */
  const requestSort = useCallback(
    (key: keyof User) => {
      setSortConfig((prev) => {
        if (prev && prev.key === key && prev.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key, direction: 'asc' };
      });
      setCurrentPage(1);
    },
    [],
  );

  const getSortIndicator = useCallback(
    (key: keyof User) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    },
    [sortConfig],
  );

  /* ---------- role helpers ---------- */
  const creatableRoles = useCallback(() => {
    if (currentUser?.role === 'desa') {
      return ROLES.filter((r) => ['kelompok', 'guru', 'orangtua'].includes(r));
    }
    if (currentUser?.role === 'kelompok') {
      return ROLES.filter((r) => ['guru', 'orangtua'].includes(r));
    }
    if (currentUser?.role === 'admin') {
      return ROLES.filter((r) => r !== 'adminsuper');
    }
    return [...ROLES];
  }, [currentUser]);

  const canResetPassword = useCallback(
    (target: User): boolean => {
      if (!currentUser || target.id === currentUser.id) return false;
      const hierarchy: Record<Role, number> = {
        adminsuper: 4, admin: 3, desa: 2, kelompok: 1, guru: 0, orangtua: 0,
      };
      const currentLevel = hierarchy[currentUser.role];
      const targetLevel = hierarchy[target.role];
      if (currentLevel <= targetLevel) return false;
      if (currentUser.role === 'desa' && target.desa !== currentUser.desa) return false;
      if (currentUser.role === 'kelompok') {
        if (target.desa !== currentUser.desa) return false;
        if (target.kelompok !== currentUser.kelompok) return false;
      }
      return true;
    },
    [currentUser],
  );

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
    creatableRoles,
    canResetPassword,

    // password reset
    onResetUserPassword,
  };
}
