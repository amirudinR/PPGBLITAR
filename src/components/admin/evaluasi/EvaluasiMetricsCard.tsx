import React from 'react';
import { EvaluasiMetrics } from '@/types/evaluasi';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  metrics: EvaluasiMetrics | null;
  aggregating: boolean;
  canEdit: boolean;
  isOrangtua: boolean;
  isPublished: boolean;
  onAutoAggregate: () => void;
}

export default function EvaluasiMetricsCard({
  metrics,
  aggregating,
  canEdit,
  isOrangtua,
  isPublished,
  onAutoAggregate,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-muted-foreground">Rekap Akademik</p>
        {canEdit && !isOrangtua && !isPublished && (
          <Button size="sm" variant="outline" onClick={onAutoAggregate} disabled={aggregating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${aggregating ? 'animate-spin' : ''}`} />
            {aggregating ? 'Mengambil data...' : 'Agregasi Otomatis'}
          </Button>
        )}
      </div>
      {metrics ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Kehadiran</p>
            <p className="text-xl font-bold">{metrics.kehadiran.persen}%</p>
            <p className="text-xs text-muted-foreground">{metrics.kehadiran.hadir}/{metrics.kehadiran.total}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Rata-rata Nilai</p>
            <p className="text-xl font-bold">{metrics.nilai.rataRata.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pencapaian Materi</p>
            <p className="text-xl font-bold">{metrics.pencapaianMateri.persen}%</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Klik "Agregasi Otomatis" untuk mengambil data kehadiran dan nilai.</p>
      )}
    </div>
  );
}
