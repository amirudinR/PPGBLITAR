import React from 'react';
import { User } from '@/types/admin';
import { useNotifications } from '@/hooks/useNotifications';
import { useChecklistAssignments } from '@/hooks/useChecklist';
import { Bell, ListChecks, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  currentUser: User | null;
  onNavigate: (section: string) => void;
}

export default function NewFeaturesWidget({ currentUser, onNavigate }: Props) {
  const { unreadCount } = useNotifications(currentUser);
  const { assignments } = useChecklistAssignments(currentUser);

  const pendingChecklists = assignments.filter((a) => a.status === 'belum' || a.status === 'proses').length;
  const overdueChecklists = assignments.filter((a) => a.status === 'terlambat').length;

  const items = [
    {
      icon: Bell,
      label: 'Notifikasi belum dibaca',
      count: unreadCount,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      section: 'notifikasi',
      show: unreadCount > 0,
    },
    {
      icon: ListChecks,
      label: 'Checklist belum selesai',
      count: pendingChecklists,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      section: 'checklist-saya',
      show: pendingChecklists > 0,
    },
    {
      icon: AlertTriangle,
      label: 'Checklist terlambat',
      count: overdueChecklists,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      section: 'checklist-saya',
      show: overdueChecklists > 0,
    },
  ].filter((i) => i.show);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-semibold mb-3">Perlu Perhatian</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                'flex items-center justify-between rounded-lg p-3 transition-opacity hover:opacity-80 text-left',
                item.bg,
              )}
              onClick={() => onNavigate(item.section)}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-5 h-5 shrink-0', item.color)} />
                <div>
                  <p className={cn('text-2xl font-bold leading-none', item.color)}>{item.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
