import React from 'react';
import { EvaluasiSemester, AspekKepribadian, EvaluasiMetrics } from '@/types/evaluasi';
import { Generus } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Download, Send } from 'lucide-react';
import { generateEvaluasiPDF } from '@/utils/evaluasiAggregator';

const ASPEK_LABELS: Record<keyof Omit<AspekKepribadian, 'catatanAspek'>, string> = {
  akhlak: 'Akhlak',
  kedisiplinan: 'Kedisiplinan',
  kemandirian: 'Kemandirian',
  kerjasama: 'Kerjasama',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluasi?: EvaluasiSemester;
  generusItem?: Generus;
  aspek: AspekKepribadian;
  onAspekChange: (aspek: AspekKepribadian) => void;
  catatanGuru: string;
  onCatatanGuruChange: (value: string) => void;
  rekomendasi: string;
  onRekomendasiChange: (value: string) => void;
  dialogMetrics: EvaluasiMetrics | null;
  aggregating: boolean;
  canEdit: boolean;
  isOrangtua: boolean;
  onAutoAggregate: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function EvaluasiDetailDialog({
  open,
  onOpenChange,
  evaluasi,
  generusItem,
  aspek,
  onAspekChange,
  catatanGuru,
  onCatatanGuruChange,
  rekomendasi,
  onRekomendasiChange,
  dialogMetrics,
  aggregating,
  canEdit,
  isOrangtua,
  onAutoAggregate,
  onSaveDraft,
  onSubmit,
}: Props) {
  const title = `Evaluasi: ${generusItem?.name ?? evaluasi?.generusName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Metrics summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Rekap Akademik</p>
              {canEdit && !isOrangtua && evaluasi?.status !== 'published' && (
                <Button size="sm" variant="outline" onClick={onAutoAggregate} disabled={aggregating}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${aggregating ? 'animate-spin' : ''}`} />
                  {aggregating ? 'Mengambil data...' : 'Agregasi Otomatis'}
                </Button>
              )}
            </div>
            {dialogMetrics ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Kehadiran</p>
                  <p className="text-xl font-bold">{dialogMetrics.kehadiran.persen}%</p>
                  <p className="text-xs text-muted-foreground">{dialogMetrics.kehadiran.hadir}/{dialogMetrics.kehadiran.total}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Rata-rata Nilai</p>
                  <p className="text-xl font-bold">{dialogMetrics.nilai.rataRata.toFixed(1)}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pencapaian Materi</p>
                  <p className="text-xl font-bold">{dialogMetrics.pencapaianMateri.persen}%</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Klik "Agregasi Otomatis" untuk mengambil data kehadiran dan nilai.</p>
            )}
          </div>

          {/* Aspek Kepribadian */}
          <div>
            <h4 className="font-semibold mb-3">Aspek Kepribadian</h4>
            <div className="space-y-4">
              {(Object.keys(ASPEK_LABELS) as (keyof typeof ASPEK_LABELS)[]).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <Label>{ASPEK_LABELS[key]}</Label>
                    <span className="text-sm font-medium">{aspek[key]}/5</span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[aspek[key]]}
                    onValueChange={([v]) => onAspekChange({ ...aspek, [key]: v })}
                    disabled={!canEdit || isOrangtua || evaluasi?.status === 'published'}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label>Catatan Aspek</Label>
              <Textarea
                className="mt-1"
                value={aspek.catatanAspek ?? ''}
                onChange={(e) => onAspekChange({ ...aspek, catatanAspek: e.target.value })}
                disabled={!canEdit || isOrangtua || evaluasi?.status === 'published'}
              />
            </div>
          </div>

          <div>
            <Label>Catatan Guru</Label>
            <Textarea
              className="mt-1"
              value={catatanGuru}
              onChange={(e) => onCatatanGuruChange(e.target.value)}
              disabled={!canEdit || isOrangtua || evaluasi?.status === 'published'}
            />
          </div>

          <div>
            <Label>Rekomendasi</Label>
            <Textarea
              className="mt-1"
              value={rekomendasi}
              onChange={(e) => onRekomendasiChange(e.target.value)}
              disabled={!canEdit || isOrangtua || evaluasi?.status === 'published'}
            />
          </div>
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          {evaluasi?.status === 'published' && (
            <Button variant="outline" onClick={() => evaluasi && generateEvaluasiPDF({
              generusName: evaluasi.generusName,
              semester: evaluasi.semester,
              tahunAjaran: evaluasi.tahunAjaran,
              metrics: dialogMetrics ?? evaluasi.metrics,
              aspekKepribadian: aspek as unknown as Record<string, number>,
              catatanGuru,
              rekomendasi,
            })}>
              <Download className="w-4 h-4 mr-2" />Export PDF
            </Button>
          )}
          {canEdit && !isOrangtua && evaluasi?.status !== 'published' && (
            <>
              <Button variant="outline" onClick={onSaveDraft}>Simpan Draft</Button>
              <Button onClick={onSubmit}>
                <Send className="w-4 h-4 mr-2" />Kirim untuk Review
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
