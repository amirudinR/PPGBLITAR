import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { User } from '@/types/admin';
import { AppNotification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const TYPE_LABELS: Record<AppNotification['type'], string> = {
  'm5u_outstanding': 'Outstanding M5U',
  'm5u_scheduled': 'Musyawaroh Dijadwalkan',
  'checklist_assigned': 'Checklist Baru',
  'checklist_due': 'Jatuh Tempo',
  'checklist_overdue': 'Terlambat',
  'evaluasi_published': 'Evaluasi',
};

interface Props {
  currentUser: User | null;
  onNavigate: (section: string) => void;
}

export default function NotificationBell({ currentUser, onNavigate }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(currentUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recent = notifications.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifikasi"
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifikasi</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                  Tandai semua
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y">
            {recent.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Tidak ada notifikasi</p>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors',
                    !n.read && 'bg-primary/5',
                  )}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) onNavigate(n.link);
                    setOpen(false);
                  }}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  {n.read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{TYPE_LABELS[n.type]}</p>
                    <p className="text-sm font-medium leading-snug truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                    {n.createdAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(n.createdAt.toDate?.() ?? new Date(n.createdAt), 'dd MMM, HH:mm', { locale: localeId })}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => { onNavigate('notifikasi'); setOpen(false); }}
            >
              Lihat semua notifikasi <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
