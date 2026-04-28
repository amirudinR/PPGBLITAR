import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UploadMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadMaterialDialog({
  isOpen,
  onOpenChange,
  onFileUpload
}: UploadMaterialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Materi dari Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan beberapa materi sekaligus. Pastikan file memiliki kolom: "Judul Materi", "Rincian Materi", "Kelas", "Semester", dan "Target Bulan".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input type="file" accept=".xlsx, .xls" onChange={onFileUpload} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
