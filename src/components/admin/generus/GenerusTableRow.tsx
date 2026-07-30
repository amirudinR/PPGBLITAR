import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Generus, getJenjangUsia } from '@/types/admin';
import { format, parse, isValid } from 'date-fns';
import GenerusDeleteDialog from './GenerusDeleteDialog';

const AKTIVITAS_LABEL: Record<string, string> = {
  bekerja: 'Bekerja',
  mondok: 'Mondok',
  tugas: 'Tugas',
};

interface GenerusTableRowProps {
  generus: Generus;
  onEdit: (generus: Generus) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (!isValid(d)) return dateStr;
  return format(d, 'dd/MM/yyyy');
}

export default function GenerusTableRow({ generus, onEdit, onDelete }: GenerusTableRowProps) {
  const aktivitasDetail = generus.aktivitas === 'bekerja' ? generus.pekerjaan
    : generus.aktivitas === 'mondok' ? generus.statusMondok
    : generus.aktivitas === 'tugas' ? generus.tugas
    : '';

  return (
    <TableRow key={generus.id}>
      <TableCell>{generus.name}</TableCell>
      <TableCell>{formatDate(generus.tanggalLahir)}</TableCell>
      <TableCell>{generus.tahunLahir}</TableCell>
      <TableCell>{generus.pendidikan}</TableCell>
      <TableCell>{generus.jurusan || '-'}</TableCell>
      <TableCell>{getJenjangUsia(generus.pendidikan)}</TableCell>
      <TableCell>
        {generus.aktivitas ? (
          <span title={aktivitasDetail || ''}>
            {AKTIVITAS_LABEL[generus.aktivitas] || generus.aktivitas}
            {aktivitasDetail ? ` (${aktivitasDetail})` : ''}
          </span>
        ) : '-'}
      </TableCell>
      <TableCell>{generus.mt}</TableCell>
      <TableCell>{generus.desa}</TableCell>
      <TableCell>{generus.kelompok}</TableCell>
      <TableCell>{generus.namaAyah}</TableCell>
      <TableCell className="uppercase">{generus.statusAyah}</TableCell>
      <TableCell>{generus.namaIbu}</TableCell>
      <TableCell className="uppercase">{generus.statusIbu}</TableCell>
      <TableCell className="text-center">
        <Button variant="ghost" size="icon" onClick={() => onEdit(generus)}>
          <Edit className="w-4 h-4 text-[hsl(var(--info))]" />
        </Button>
        <GenerusDeleteDialog onDelete={() => onDelete(generus.id)} />
      </TableCell>
    </TableRow>
  );
}
