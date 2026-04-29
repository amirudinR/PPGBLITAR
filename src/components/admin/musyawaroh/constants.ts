import React from 'react';
import { M5UAttendee, M5UActionItem } from '@/types/admin';
import { AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const STATUS_HADIR_LABELS: Record<M5UAttendee['status'], string> = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alpa: 'Alpa',
};

export const STATUS_HADIR_COLORS: Record<M5UAttendee['status'], string> = {
  hadir: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  izin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sakit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  alpa: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const ACTION_STATUS_CONFIG: Record<M5UActionItem['status'], { label: string; icon: React.ElementType; color: string }> = {
  belum: { label: 'Belum', icon: AlertTriangle, color: 'text-yellow-600' },
  proses: { label: 'Dalam Proses', icon: Clock, color: 'text-blue-600' },
  selesai: { label: 'Selesai', icon: CheckCircle2, color: 'text-green-600' },
  mansuh: { label: 'Mansuh', icon: XCircle, color: 'text-muted-foreground' },
};
