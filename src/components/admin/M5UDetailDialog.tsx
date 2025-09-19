import React, { useMemo } from 'react';
import { M5U } from '@/types/admin';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface M5UDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: M5U | null;
  m5uItems: M5U[];
  canEdit: boolean;
  onEdit: (item: M5U) => void;
  onDelete: (id: string) => void;
}

export default function M5UDetailDialog({ 
  isOpen, 
  onClose, 
  item, 
  m5uItems,
  canEdit,
  onEdit,
  onDelete
}: M5UDetailDialogProps) {
  // Aggregate data by month and year for the specific item
  const aggregatedData = useMemo(() => {
    if (!item) return [];
    return m5uItems.filter(m => m.bulan === item.bulan && m.tahun === item.tahun);
  }, [item, m5uItems]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Agenda M5U</DialogTitle>
        </DialogHeader>
        {item && (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Bulan</Label>
                <p>{item.bulan}</p>
              </div>
              <div>
                <Label className="font-semibold">Tahun</Label>
                <p>{item.tahun}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="font-semibold">Agenda</Label>
                <p>{item.agenda}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="font-semibold">Hasil</Label>
                <p>{item.hasil || '-'}</p>
              </div>
              <div>
                <Label className="font-semibold">Penanggung Jawab</Label>
                <p>{item.pj}</p>
              </div>
              <div>
                <Label className="font-semibold">Waktu Pelaksanaan</Label>
                <p>{item.waktuPelaksanaan || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="font-semibold">Status Hasil</Label>
                <p>{item.statusHasil || '-'}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Semua Agenda di {item.bulan} {item.tahun}</h3>
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agenda</TableHead>
                      <TableHead>PJ</TableHead>
                      <TableHead>Status</TableHead>
                      {canEdit && <TableHead className="text-center">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aggregatedData.map((agendaItem, index) => (
                      <TableRow key={index}>
                        <TableCell>{agendaItem.agenda}</TableCell>
                        <TableCell>{agendaItem.pj}</TableCell>
                        <TableCell>{agendaItem.statusHasil}</TableCell>
                        {canEdit && (
                          <TableCell className="text-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(agendaItem)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini akan menghapus agenda ini secara permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDelete(agendaItem.id)}
                                  >
                                    Hapus
                                  </AlertDialogAction>
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
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}