import React from 'react';
import { Generus } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FilteredGenerusTableProps {
  generus: Generus[];
}

export default function FilteredGenerusTable({ generus }: FilteredGenerusTableProps) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs">
      <CardHeader>
        <CardTitle>Hasil Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Pendidikan</TableHead>
                <TableHead>Desa</TableHead>
                <TableHead>Kelompok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generus.length > 0 ? (
                generus.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.pendidikan}</TableCell>
                    <TableCell>{item.desa}</TableCell>
                    <TableCell>{item.kelompok}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Tidak ada data yang cocok dengan filter ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}