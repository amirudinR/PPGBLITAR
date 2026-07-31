import React from 'react';
import { Generus, Kelas } from '@/types/admin';
import { EvaluasiSemester, EvaluasiPeriode } from '@/types/evaluasi';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from '../shared/EmptyState';

const STATUS_CONFIG: Record<EvaluasiSemester['status'], { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  reviewed: { label: 'Direview', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  published: { label: 'Dipublikasikan', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

interface Props {
  generus: Generus[];
  kelas: Kelas[];
  evaluasiList: EvaluasiSemester[];
  activePeriode: EvaluasiPeriode | null;
  onOpenDialog: (ev: EvaluasiSemester, g?: Generus) => void;
  getKelasForGenerus: (g: Generus) => Kelas | undefined;
  currentUser: { id?: string } | null;
}

export default function EvaluasiFillTable({
  generus,
  kelas,
  evaluasiList,
  activePeriode,
  onOpenDialog,
  getKelasForGenerus,
  currentUser,
}: Props) {
  if (!activePeriode) {
    return <EmptyState title="Belum ada periode aktif" description="Tunggu admin membuka periode evaluasi." />;
  }

  if (generus.length === 0) {
    return <EmptyState title="Tidak ada generus" description="Tidak ada generus dalam kelas Anda pada periode ini." />;
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Generus</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Status Evaluasi</TableHead>
            <TableHead>Kehadiran</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generus.map((g) => {
            const ev = evaluasiList.find((e) => e.generusId === g.id);
            const kelasItem = getKelasForGenerus(g);
            const statusCfg = ev ? STATUS_CONFIG[ev.status] : null;
            return (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>{kelasItem?.namaKelas ?? '—'}</TableCell>
                <TableCell>
                  {ev ? (
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusCfg?.color)}>
                      {statusCfg?.label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum diisi</span>
                  )}
                </TableCell>
                <TableCell>
                  {ev?.metrics.kehadiran ? (
                    <div className="flex items-center gap-2">
                      <Progress value={ev.metrics.kehadiran.persen} className="h-2 w-16" />
                      <span className="text-xs">{ev.metrics.kehadiran.persen}%</span>
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-center">
                  {ev ? (
                    <Button size="sm" variant="outline" onClick={() => onOpenDialog(ev, g)}>
                      <Eye className="w-4 h-4 mr-1" />Detail
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!activePeriode?.isOpen}
                      onClick={() => {
                        const kelasItem = getKelasForGenerus(g);
                        const newEv: EvaluasiSemester = {
                          id: '',
                          generusId: g.id,
                          generusName: g.name,
                          kelasId: kelasItem?.id ?? '',
                          desa: g.desa ?? '',
                          kelompok: g.kelompok ?? '',
                          semester: activePeriode!.semester,
                          tahunAjaran: activePeriode!.tahunAjaran,
                          periode: { startDate: activePeriode!.startDate, endDate: activePeriode!.endDate },
                          metrics: {
                            kehadiran: { hadir: 0, total: 0, persen: 0 },
                            nilai: { rataRata: 0, perMateri: {} },
                            pencapaianMateri: { tercapai: 0, total: 0, persen: 0 },
                          },
                          status: 'draft',
                          filledBy: currentUser?.id,
                        };
                        onOpenDialog(newEv, g);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />Isi
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
