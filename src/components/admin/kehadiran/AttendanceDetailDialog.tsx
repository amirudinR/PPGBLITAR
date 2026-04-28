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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Kehadiran Kelas: {selectedClass?.namaKelas}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead className="text-center">Total Kehadiran</TableHead>
                <TableHead className="w-40">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailData.map(student => {
                const percentage = student.held > 0 ? Math.round((student.attended / student.held) * 100) : 0;
                return (
                  <TableRow key={student.name}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-center">{student.attended} / {student.held}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-24" />
                        <span>{percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
