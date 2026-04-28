import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from 'lucide-react';
import { Material } from '@/types/admin';

interface MaterialsTableProps {
  materials: Material[];
  canEdit: boolean;
  selectedMaterials: string[];
  onSelectAll: (checked: boolean | 'indeterminate') => void;
  onSelectOne: (id: string, checked: boolean | 'indeterminate') => void;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export default function MaterialsTable({
  materials,
  canEdit,
  selectedMaterials,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete
}: MaterialsTableProps) {
  return (
    <div className="bg-card rounded-lg shadow overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {canEdit && (
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedMaterials.length === materials.length && materials.length > 0} 
                  onCheckedChange={onSelectAll} 
                  aria-label="Pilih semua" 
                />
              </TableHead>
            )}
            <TableHead>Judul Materi</TableHead>
            <TableHead>Rincian Materi</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Target Bulan</TableHead>
            {canEdit && <TableHead className="text-center">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              {canEdit && (
                <TableCell>
                  <Checkbox 
                    checked={selectedMaterials.includes(material.id)} 
                    onCheckedChange={(checked) => onSelectOne(material.id, checked)} 
                    aria-label={`Pilih materi ${material.judulMateri}`} 
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{material.judulMateri}</TableCell>
              <TableCell className="whitespace-pre-wrap max-w-sm">{material.rincianMateri}</TableCell>
              <TableCell>{material.kelas}</TableCell>
              <TableCell>{material.semester}</TableCell>
              <TableCell>{Array.isArray(material.targetBulan) ? material.targetBulan.join(', ') : material.targetBulan}</TableCell>
              {canEdit && (
                <TableCell className="text-center">
                  <button 
                    onClick={() => onEdit(material)} 
                    className="p-2 text-[hsl(var(--info))] hover:bg-[hsl(var(--info)/0.1)] rounded mr-2"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 text-destructive hover:bg-destructive/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus materi ini secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(material.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
