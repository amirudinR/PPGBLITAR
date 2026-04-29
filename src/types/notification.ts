import { Role } from './user';

export type NotificationType =
  | 'm5u_outstanding'
  | 'm5u_scheduled'
  | 'checklist_assigned'
  | 'checklist_due'
  | 'checklist_overdue'
  | 'evaluasi_published';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: any;
  meta?: {
    entityId: string;
    entityType: 'm5u' | 'actionItem' | 'checklist' | 'evaluasi';
  };
}
