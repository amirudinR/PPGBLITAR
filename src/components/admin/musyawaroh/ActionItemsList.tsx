import React from 'react';
import { M5UActionItem } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ACTION_STATUS_CONFIG } from './constants';

const STATUS_ICONS: Record<M5UActionItem['status'], React.ElementType> = {
  belum: AlertTriangle,
  proses: Clock,
  selesai: CheckCircle2,
  mansuh: XCircle,
};

interface Props {
  items: M5UActionItem[];
  canEdit: boolean;
  onEdit: (item: M5UActionItem) => void;
  onDelete: (id: string) => void;
}

export default function ActionItemsList({ items, canEdit, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return null; // Let parent handle empty state
  }

  return (
    <div className="space-y-3">
      {items.map((ai) => {
        const statusCfg = ACTION_STATUS_CONFIG[ai.status];
        const StatusIcon = STATUS_ICONS[ai.status];
        return (
          <div key={ai.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{ai.deskripsi}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span>PJ: <span className="text-foreground">{ai.pjName}</span></span>
                  {ai.dueDate && (
                    <span>
                      Deadline:{' '}
                      <span className="text-foreground">
                        {format(ai.dueDate.toDate?.() ?? new Date(ai.dueDate), 'dd MMM yyyy', { locale: localeId })}
                      </span>
                    </span>
                  )}
                </div>
                {ai.catatan && <p className="mt-2 text-sm text-muted-foreground">{ai.catatan}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`flex items-center gap-1 text-xs font-medium ${statusCfg.color}`}>
                  <StatusIcon className="w-4 h-4" />{statusCfg.label}
                </span>
                {canEdit && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ai)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus action item?</AlertDialogTitle>
                          <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(ai.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
