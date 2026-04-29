import React from 'react';
import { EvaluasiSemester } from '@/types/evaluasi';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from '../shared/EmptyState';

const STATUS_CONFIG: Record<EvaluasiSemester['status'], { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  reviewed: { label: 'Direview', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  published: { label: 'Dipublikasikan', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

interface Props {
  evaluasiList: EvaluasiSemester[];
  canPublish: boolean;
  onPublish: (id: string) => void;
}

export default function EvaluasiViewTable({ evaluasiList, canPublish, onPublish }: Props) {
  if (evaluasiList.length === 0) {
    return <EmptyState title="Belum ada evaluasi" description="Evaluasi yang sudah diisi akan muncul di sini." />;
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Generus</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Kehadiran</TableHead>
            <TableHead>Rata-rata Nilai</TableHead>
            <TableHead>Status</TableHead>
            {canPublish && <TableHead className="text-center">Publish</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluasiList.map((ev) => {
            const statusCfg = STATUS_CONFIG[ev.status];
            return (
              <TableRow key={ev.id}>
                <TableCell className="font-medium">{ev.generusName}</TableCell>
                <TableCell className="capitalize">{ev.semester} {ev.tahunAjaran}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={ev.metrics.kehadiran.persen} className="h-2 w-16" />
                    <span className="text-xs">{ev.metrics.kehadiran.persen}%</span>
                  </div>
                </TableCell>
                <TableCell>{ev.metrics.nilai.rataRata.toFixed(1)}</TableCell>
                <TableCell>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                </TableCell>
                {canPublish && (
                  <TableCell className="text-center">
                    {ev.status !== 'published' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPublish(ev.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />Publish
                      </Button>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
