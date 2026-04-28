import { User, Role, ROLES } from '@/types/admin';

export const ROLE_HIERARCHY: Record<Role, number> = {
  adminsuper: 5,
  admin: 4,
  desa: 3,
  kelompok: 2,
  guru: 1,
  orangtua: 0,
};

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

export function getCreatableRoles(currentUserRole: Role | null): Role[] {
  if (currentUserRole === 'desa') {
    return ROLES.filter((r) => ['kelompok', 'guru', 'orangtua'].includes(r));
  }
  if (currentUserRole === 'kelompok') {
    return ROLES.filter((r) => ['guru', 'orangtua'].includes(r));
  }
  if (currentUserRole === 'admin') {
    return ROLES.filter((r) => r !== 'adminsuper');
  }
  return [...ROLES];
}

export function canResetPassword(currentUser: User | null, target: User): boolean {
  if (!currentUser || target.id === currentUser.id) return false;
  const hierarchy: Record<Role, number> = {
    adminsuper: 4,
    admin: 3,
    desa: 2,
    kelompok: 1,
    guru: 0,
    orangtua: 0,
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
}

export function filterUsersByRoleHierarchy(users: User[], currentUser: User | null): User[] {
  const currentLevel = currentUser ? ROLE_HIERARCHY[currentUser.role] : -1;
  return users.filter((u) => ROLE_HIERARCHY[u.role] <= currentLevel);
}
