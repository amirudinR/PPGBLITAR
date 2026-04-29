import { Role } from './user';

export type ChecklistFrequency = 'sekali' | 'harian' | 'mingguan' | 'bulanan' | 'per-event';
export type ChecklistEventTrigger = 'm5u' | 'awal-semester' | 'akhir-semester';
export type ChecklistItemType = 'check' | 'text' | 'number' | 'upload';
export type ChecklistAssignmentStatus = 'belum' | 'proses' | 'selesai' | 'terlambat';

export interface ChecklistItem {
  id: string;
  label: string;
  deskripsi?: string;
  wajib: boolean;
  tipe: ChecklistItemType;
}

export interface ChecklistTemplate {
  id: string;
  nama: string;
  deskripsi: string;
  targetRoles: Role[];
  frekuensi: ChecklistFrequency;
  eventTrigger?: ChecklistEventTrigger;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: any;
  isActive: boolean;
}

export interface ChecklistResponse {
  value: string | boolean | number;
  completedAt: any;
  fileUrl?: string;
}

export interface ChecklistAssignment {
  id: string;
  templateId: string;
  templateNama: string;
  assigneeId: string;
  assigneeName: string;
  assigneeRole: Role;
  desa: string;
  kelompok: string;
  periode: {
    type: ChecklistFrequency;
    value: string;
  };
  dueDate: any;
  status: ChecklistAssignmentStatus;
  responses: Record<string, ChecklistResponse>;
  progress: number;
  submittedAt?: any;
  reviewedBy?: string;
  reviewNote?: string;
}
