import React from 'react';
import { Badge } from '@/components/ui/badge';

type StatusVariant = 'success' | 'warning' | 'danger' | 'muted' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

const STATUS_CLASS_MAP: Record<StatusVariant, string> = {
  success: 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]',
  warning: 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)]',
  danger: 'bg-destructive/15 text-destructive border-destructive/30',
  muted: 'bg-muted text-foreground border-border',
  info: 'bg-[hsl(var(--info)/0.15)] text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)]',
};

export default function StatusBadge({ label, variant = 'muted' }: StatusBadgeProps) {
  return (
    <Badge className={STATUS_CLASS_MAP[variant]} variant="outline">
      {label}
    </Badge>
  );
}
