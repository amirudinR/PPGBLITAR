import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { Generus, getJenjangUsia } from '@/types/admin';
import GenerusDeleteDialog from './GenerusDeleteDialog';

interface GenerusTableRowProps {
  generus: Generus;
  onEdit: (generus: Generus) => void;
  onDelete: (id: string) => void;
}

export default function GenerusTableRow({ generus, onEdit, onDelete }: GenerusTableRowProps) {
  return (
    <TableRow key={generus.id}>
      <TableCell>{generus.name}</TableCell>
      <TableCell>{generus.tahunLahir}</TableCell>
      <TableCell>{generus.pendidikan}</TableCell>
      <TableCell>{getJenjangUsia(generus.pendidikan)}</TableCell>
      <TableCell>{generus.statusMondok}</TableCell>
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
