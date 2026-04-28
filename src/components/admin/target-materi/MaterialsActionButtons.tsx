import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Upload, Download } from 'lucide-react';

interface MaterialsActionButtonsProps {
  selectedMaterialsCount: number;
  onDownloadTemplate: () => void;
  onUploadDialogOpen: () => void;
  onAddDialogOpen: () => void;
  onDeleteSelected: () => void;
  uploadDialogContent: React.ReactNode;
}

export default function MaterialsActionButtons({
  selectedMaterialsCount,
  onDownloadTemplate,
  onUploadDialogOpen,
  onAddDialogOpen,
  onDeleteSelected,
  uploadDialogContent
}: MaterialsActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {selectedMaterialsCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus ({selectedMaterialsCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus {selectedMaterialsCount} materi yang dipilih secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteSelected}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button variant="outline" onClick={onDownloadTemplate}>
        <Download className="w-4 h-4 mr-2" />
        Template
      </Button>
      <Dialog onOpenChange={onUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Materi dari Excel</DialogTitle>
            <DialogDescription>
              Unggah file Excel untuk menambahkan beberapa materi sekaligus. Pastikan file memiliki kolom: "Judul Materi", "Rincian Materi", "Kelas", "Semester", dan "Target Bulan".
            </DialogDescription>
          </DialogHeader>
          {uploadDialogContent}
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={onAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Materi
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
