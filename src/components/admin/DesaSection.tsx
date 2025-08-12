import React from 'react';
import { Desa } from '@/types/admin';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DesaSectionProps {
  desas: Desa[];
}

export default function DesaSection({ desas }: DesaSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Desa</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Desa</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Desa</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {desas.map((desa) => (
              <TableRow key={desa.id}>
                <TableCell>{desa.name}</TableCell>
                <TableCell className="text-center">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}