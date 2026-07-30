import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Eye, GraduationCap } from 'lucide-react';
import { Kelas, User } from '@/types/admin';
import { EmptyState } from '@/components/ui/empty-state';

type SummaryData = {
  [key: string]: { attended: number; held: number };
};

interface RestrictedViewProps {
  summaryData: SummaryData;
  kelas: Kelas[];
  currentUser: User | null;
  onViewDetails: (kelas: Kelas) => void;
}

export default function RestrictedView({ summaryData, kelas, currentUser, onViewDetails }: RestrictedViewProps) {
  const viewTitle = currentUser?.role === 'kelompok' 
    ? `Rekap Kehadiran Kelompok: ${currentUser.kelompok || ''}` 
    : 'Rekap Kehadiran Kelas Saya';

  return (
    <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
      <CardHeader className="border-b border-border/50 px-6 py-4">
        <CardTitle className="text-base font-bold text-foreground">{viewTitle}</CardTitle>
      </CardHeader>
      
      {kelas.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={GraduationCap}
            title="Belum Ada Kelas Terdaftar"
            description="Belum ada daftar kelas yang dapat ditampilkan untuk kelompok Anda."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/60">
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 pl-6">Nama Kelas</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5">Jenjang Usia</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5">Nama Guru</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 text-center">Total Kehadiran</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 text-center">Persentase</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3.5 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelas.map(k => {
                const stats = summaryData[k.id] || { attended: 0, held: 0 };
                const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
                return (
                  <TableRow key={k.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                    <TableCell className="font-semibold text-foreground py-4 pl-6">{k.namaKelas}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-4">{k.jenjangUsia}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-4">{k.guruName || '-'}</TableCell>
                    <TableCell className="text-center font-semibold text-xs py-4">{stats.attended} / {stats.held}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
                        <Progress value={percentage} className="h-2 flex-1 rounded-full" />
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          percentage >= 85
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : percentage >= 65
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <Button variant="outline" size="sm" onClick={() => onViewDetails(k)} className="rounded-xl border-border/80 text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
