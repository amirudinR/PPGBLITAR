import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GenerusTableHeaderProps {
  requestSort: (key: string) => void;
  getSortIndicator: (key: string) => string | null;
}

export default function GenerusTableHeader({ requestSort, getSortIndicator }: GenerusTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('name')}
        >
          Nama Generus{getSortIndicator('name')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('tahunLahir')}
        >
          Tahun Lahir{getSortIndicator('tahunLahir')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('pendidikan')}
        >
          Pendidikan{getSortIndicator('pendidikan')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('jenjangUsia')}
        >
          Jenjang Usia{getSortIndicator('jenjangUsia')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('statusMondok')}
        >
          Status Mondok{getSortIndicator('statusMondok')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('desa')}
        >
          Desa{getSortIndicator('desa')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('kelompok')}
        >
          Kelompok{getSortIndicator('kelompok')}
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('namaAyah')}
        >
          Nama Ayah{getSortIndicator('namaAyah')}
        </TableHead>
        <TableHead className="whitespace-nowrap">Status Ayah</TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-muted whitespace-nowrap"
          onClick={() => requestSort('namaIbu')}
        >
          Nama Ibu{getSortIndicator('namaIbu')}
        </TableHead>
        <TableHead className="whitespace-nowrap">Status Ibu</TableHead>
        <TableHead className="text-center whitespace-nowrap">Aksi</TableHead>
      </TableRow>
    </TableHeader>
  );
}
