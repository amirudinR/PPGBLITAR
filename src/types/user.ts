export const ROLES = ['adminsuper', 'admin', 'desa', 'kelompok', 'guru', 'orangtua'] as const;
export type Role = typeof ROLES[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  desa?: string;
  kelompok?: string;
  password?: string;
}
