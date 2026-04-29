import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  isManager: boolean;
  onNavigate?: (section: string) => void;
}

export default function EvaluasiWarningBanner({ isManager, onNavigate }: Props) {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-4 mb-6 text-sm text-yellow-800 dark:text-yellow-300 flex items-center justify-between gap-4">
      <span>
        {isManager
          ? 'Belum ada periode evaluasi yang aktif. Buat periode baru di menu Periode Evaluasi.'
          : 'Periode evaluasi belum dibuka. Hubungi Admin atau Admin Super untuk membuka periode.'}
      </span>
      {isManager && onNavigate && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-yellow-400 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
          onClick={() => onNavigate('evaluasi-periode')}
        >
          Buka Periode Evaluasi
        </Button>
      )}
    </div>
  );
}
