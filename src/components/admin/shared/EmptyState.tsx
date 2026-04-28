import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-8 text-center', className)}>
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
