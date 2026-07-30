import React, { useMemo } from 'react';
import { User } from '@/types/admin';
import { ChecklistAssignment } from '@/types/checklist';
import SectionHeader from '../shared/SectionHeader';
import EmptyState from '../shared/EmptyState';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

interface RoleStats {
  role: string;
  total: number;
  selesai: number;
  proses: number;
  terlambat: number;
  persen: number;
}

interface Props {
  currentUser: User | null;
  assignments: ChecklistAssignment[];
  loading: boolean;
}

export default function ChecklistRekapSection({ currentUser, assignments, loading }: Props) {

  const roleStats = useMemo<RoleStats[]>(() => {
    const map: Record<string, RoleStats> = {};
    assignments.forEach((a) => {
      const r = a.assigneeRole;
      if (!map[r]) map[r] = { role: r, total: 0, selesai: 0, proses: 0, terlambat: 0, persen: 0 };
      map[r].total++;
      if (a.status === 'selesai') map[r].selesai++;
      else if (a.status === 'proses') map[r].proses++;
      else if (a.status === 'terlambat') map[r].terlambat++;
    });
    return Object.values(map).map((s) => ({
      ...s,
      persen: s.total > 0 ? Math.round((s.selesai / s.total) * 100) : 0,
    }));
  }, [assignments]);

  const templateStats = useMemo(() => {
    const map: Record<string, { nama: string; total: number; selesai: number }> = {};
    assignments.forEach((a) => {
      const key = a.templateId;
      if (!map[key]) map[key] = { nama: a.templateNama, total: 0, selesai: 0 };
      map[key].total++;
      if (a.status === 'selesai') map[key].selesai++;
    });
    return Object.values(map).map((s) => ({
      ...s,
      persen: s.total > 0 ? Math.round((s.selesai / s.total) * 100) : 0,
    }));
  }, [assignments]);

  if (loading) return <div className="text-center p-8 text-muted-foreground">Memuat rekap...</div>;

  return (
    <div>
      <SectionHeader
        title="Rekap Checklist"
        subtitle="Ringkasan completion rate checklist per peran dan per template."
      />

      {assignments.length === 0 ? (
        <EmptyState
          title="Belum ada data checklist"
          description="Data rekap akan muncul setelah ada checklist yang di-assign."
        />
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />Rekap per Peran
            </h3>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peran</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Selesai</TableHead>
                    <TableHead className="text-center">Proses</TableHead>
                    <TableHead className="text-center">Terlambat</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleStats.map((s) => (
                    <TableRow key={s.role}>
                      <TableCell className="font-medium capitalize">{s.role}</TableCell>
                      <TableCell className="text-center">{s.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">{s.selesai}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{s.proses}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">{s.terlambat}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.persen} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-10 text-right">{s.persen}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Rekap per Template</h3>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Template</TableHead>
                    <TableHead className="text-center">Total Assignment</TableHead>
                    <TableHead className="text-center">Selesai</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateStats.map((s) => (
                    <TableRow key={s.nama}>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell className="text-center">{s.total}</TableCell>
                      <TableCell className="text-center">{s.selesai}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.persen} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-10 text-right">{s.persen}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
