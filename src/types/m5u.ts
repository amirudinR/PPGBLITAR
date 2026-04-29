import { Role } from './user';

export interface M5U {
  id: string;
  bulan: string;
  tahun: number;
  agenda: string;
  hasil: string;
  pj: string;
  waktuPelaksanaan: string;
  statusHasil: 'Terlaksana' | 'Dalam Proses' | 'Belum Terlaksana' | 'Mansuh' | '';
  desa?: string;
  kelompok?: string;
  guruId?: string;
  tanggal?: any;
  lokasi?: string;
  linkMeet?: string;
  tingkat?: 'desa' | 'kelompok' | 'kelas' | 'gabungan';
  pesertaTargetRoles?: Role[];
  pesertaTargetIds?: string[];
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
  notulensi?: string;
  attachments?: { name: string; url: string; uploadedAt: any }[];
}

export interface M5UAttendee {
  id: string;
  userId: string;
  name: string;
  role: Role;
  desa: string;
  kelompok: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  checkInAt?: any;
  keterangan?: string;
  markedBy: string;
}

export interface M5UActionItem {
  id: string;
  deskripsi: string;
  pj: string;
  pjName: string;
  dueDate: any;
  status: 'belum' | 'proses' | 'selesai' | 'mansuh';
  buktiUrl?: string;
  catatan?: string;
  linkedTo?: { type: 'm5u' | 'checklist'; id: string };
  createdAt?: any;
  updatedAt?: any;
}
