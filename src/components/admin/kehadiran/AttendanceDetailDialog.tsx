import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Kelas } from '@/types/admin';

interface DetailStudent {
  name: string;
  attended: number;
  held: number;
}

interface AttendanceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: Kelas | null;
  detailData: DetailStudent[];
}

export default function AttendanceDetailDialog({ isOpen, onClose, selectedClass, detailData }: AttendanceDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-lg border border-border/60">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Detail Kehadiran Kelas: {selectedClass?.namaKelas}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="overflow-x-auto rounded-2xl border border-border/50">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/60">
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 pl-4">Nama Siswa</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 text-center">Total Kehadiran</TableHead>
                  <TableHead className="font-bold text-xs uppercase text-muted-foreground py-3 text-center pr-4">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailData.map(student => {
                  const percentage = student.held > 0 ? Math.round((student.attended / student.held) * 100) : 0;
                  return (
                    <TableRow key={student.name} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                      <TableCell className="font-semibold text-foreground text-xs py-3 pl-4">{student.name}</TableCell>
                      <TableCell className="text-center font-semibold text-xs py-3">{student.attended} / {student.held}</TableCell>
                      <TableCell className="py-3 pr-4">
                        <div className="flex items-center justify-center gap-3">
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
