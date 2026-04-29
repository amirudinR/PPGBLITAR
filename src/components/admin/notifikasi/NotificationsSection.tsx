import React, { useState } from 'react';
import { User } from '@/types/admin';
import { AppNotification } from '@/types/notification';
import { useNotifications } from '@/hooks/useNotifications';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<AppNotification['type'], string> = {
  'm5u_outstanding': 'Outstanding M5U',
  'm5u_scheduled': 'Musyawaroh Dijadwalkan',
  'checklist_assigned': 'Checklist Baru',
  'checklist_due': 'Checklist Jatuh Tempo',
  'checklist_overdue': 'Checklist Terlambat',
  'evaluasi_published': 'Evaluasi Diterbitkan',
};

const TYPE_COLORS: Record<AppNotification['type'], string> = {
  'm5u_outstanding': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'm5u_scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'checklist_assigned': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'checklist_due': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'checklist_overdue': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'evaluasi_published': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

interface NotificationsSectionProps {
  currentUser: User | null;
  onNavigate?: (section: string) => void;
}

export default function NotificationsSection({ currentUser, onNavigate }: NotificationsSectionProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(currentUser);
  const [filter, setFilter] = useState<'semua' | 'belum-dibaca'>('semua');

  const filtered = filter === 'belum-dibaca' ? notifications.filter((n) => !n.read) : notifications;

  if (loading) {
    return <div className="text-center p-8 text-muted-foreground">Memuat notifikasi...</div>;
  }

  return (
    <div>
      <SectionHeader
        title="Notifikasi"
        subtitle="Pengingat action items outstanding, checklist, dan evaluasi."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'semua' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('semua')}
        >
          Semua
        </Button>
        <Button
          variant={filter === 'belum-dibaca' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('belum-dibaca')}
        >
          Belum Dibaca
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs w-5 h-5">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi"
          description={filter === 'belum-dibaca' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi untuk Anda.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                notif.read ? 'bg-card' : 'bg-primary/5 border-primary/20',
              )}
            >
              <div className="mt-1 flex-shrink-0">
                <Bell className={cn('w-5 h-5', notif.read ? 'text-muted-foreground' : 'text-primary')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', TYPE_COLORS[notif.type])}>
                    {TYPE_LABELS[notif.type]}
                  </span>
                  {!notif.read && (
                    <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                {notif.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(notif.createdAt.toDate?.() ?? new Date(notif.createdAt), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {notif.link && onNavigate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Buka"
                    onClick={() => {
                      markAsRead(notif.id);
                      onNavigate(notif.link);
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                {!notif.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                    Tandai Dibaca
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
