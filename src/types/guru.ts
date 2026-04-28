export const GURU_STATUS_LIST = ['MT', 'MS', 'Asisten Pengajar'] as const;
export type GuruStatus = typeof GURU_STATUS_LIST[number];

export interface Guru {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: GuruStatus;
  phone: string;
  desa: string;
  kelompok: string;
  password?: string;
}
