import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Kelas, User } from '@/types/admin';

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
    ? `Rekap Kehadiran Kelompok: ${currentUser.kelompok}` 
    : 'Rekap Kehadiran Kelas Saya';

  return (
    <Card className="bg-card rounded-lg shadow">
      <CardHeader><CardTitle>{viewTitle}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Nama Kelas</TableHead><TableHead>Jenjang Usia</TableHead><TableHead>Nama Guru</TableHead><TableHead className="text-center">Total Kehadiran</TableHead><TableHead className="w-48">Persentase</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {kelas.map(k => {
              const stats = summaryData[k.id] || { attended: 0, held: 0 };
              const percentage = stats.held > 0 ? Math.round((stats.attended / stats.held) * 100) : 0;
              return (
                <TableRow key={k.id}>
                  <TableCell>{k.namaKelas}</TableCell>
                  <TableCell>{k.jenjangUsia}</TableCell>
                  <TableCell>{k.guruName}</TableCell>
                  <TableCell className="text-center">{stats.attended} / {stats.held}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Progress value={percentage} className="w-24" /><span>{percentage}%</span></div></TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(k)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
