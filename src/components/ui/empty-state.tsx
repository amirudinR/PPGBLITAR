import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "Data Tidak Ditemukan",
  description = "Belum ada data yang tersedia atau coba ubah kata kunci pencarian Anda.",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 ${className}`}>
      <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
        <Icon className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="rounded-xl shadow-sm gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
