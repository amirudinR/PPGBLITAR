import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  selectedCount: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
  onClear: () => void;
}

export default function BulkDeleteBar({ selectedCount, isOpen, setOpen, onDelete, onClear }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-3 px-1">
      <span className="text-sm text-muted-foreground">{selectedCount} akun dipilih</span>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Terpilih
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedCount} akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus {selectedCount} akun secara permanen dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Hapus Semua</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Batalkan Pilihan
      </Button>
    </div>
  );
}
