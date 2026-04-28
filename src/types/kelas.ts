import { JenjangUsia } from './generus';

export interface Kelas {
  id: string;
  namaKelas: string;
  guruId: string;
  guruName: string;
  jenjangUsia: JenjangUsia;
  desa: string;
  kelompok: string;
  studentIds: string[];
}
