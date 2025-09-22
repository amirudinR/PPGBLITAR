import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import * as XLSX from 'xlsx';
import { PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';

interface GenerusImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Omit<any, 'id'>[]) => Promise<boolean>; // Updated type
  currentUser: any;
}

const findCorrectCase = (list: readonly string[], value: string): string | undefined => {
  const lowercasedValue = value.trim().toLowerCase();
  return list.find(item => item.toLowerCase() === lowercasedValue);
};

export default function GenerusImportDialog({ isOpen, onClose, onImport, currentUser }: GenerusImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showError("Silakan pilih file terlebih dahulu.");
      return;
    }

    const toastId = showLoading("Memproses file Excel...");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Validasi dan transformasi data
      const validatedData: Omit<any, 'id'>[] = jsonData.map((row, index) => {
        const rowNum = index + 2; // +2 karena baris pertama header dan index dimulai dari 0
        
        // Validasi field wajib
        if (!row["Nama Generus"] || !row["Nama Generus"].toString().trim()) {
          throw new Error(`Baris ${rowNum}: Nama Generus tidak boleh kosong.`);
        }
        
        if (!row["Jenis Kelamin"]) {
          throw new Error(`Baris ${rowNum}: Jenis Kelamin tidak boleh kosong.`);
        }
        
        const jenisKelamin = row["Jenis Kelamin"].toString().trim();
        if (jenisKelamin !== "Laki-laki" && jenisKelamin !== "Perempuan") {
          throw new Error(`Baris ${rowNum}: Jenis Kelamin harus 'Laki-laki' atau 'Perempuan'.`);
        }
        
        if (!row["Tahun Lahir"]) {
          throw new Error(`Baris ${rowNum}: Tahun Lahir tidak boleh kosong.`);
        }
        
        const tahunLahir = parseInt(row["Tahun Lahir"], 10);
        if (isNaN(tahunLahir) || tahunLahir < 1900 || tahunLahir > new Date().getFullYear()) {
          throw new Error(`Baris ${rowNum}: Tahun Lahir tidak valid.`);
        }
        
        if (!row["Pendidikan"]) {
          throw new Error(`Baris ${rowNum}: Pendidikan tidak boleh kosong.`);
        }
        
        const correctPendidikan = findCorrectCase(PENDIDIKAN_LIST, row["Pendidikan"]);
        if (!correctPendidikan) {
          throw new Error(`Baris ${rowNum}: Pendidikan "${row["Pendidikan"]}" tidak valid.`);
        }
        
        if (!row["Status Mondok"]) {
          throw new Error(`Baris ${rowNum}: Status Mondok tidak boleh kosong.`);
        }
        
        const correctStatusMondok = findCorrectCase(STATUS_MONDOK_LIST, row["Status Mondok"]);
        if (!correctStatusMondok) {
          throw new Error(`Baris ${rowNum}: Status Mondok "${row["Status Mondok"]}" tidak valid.`);
        }
        
        // Validasi status ayah/ibu
        const statusAyah = row["Status Ayah"] ? row["Status Ayah"].toString().trim().toLowerCase() : '';
        const statusIbu = row["Status Ibu"] ? row["Status Ibu"].toString().trim().toLowerCase() : '';
        
        if (statusAyah && statusAyah !== "jm" && statusAyah !== "hum") {
          throw new Error(`Baris ${rowNum}: Status Ayah harus 'jm' atau 'hum'.`);
        }
        
        if (statusIbu && statusIbu !== "jm" && statusIbu !== "hum") {
          throw new Error(`Baris ${rowNum}: Status Ibu harus 'jm' atau 'hum'.`);
        }

        return {
          name: row["Nama Generus"].toString().trim(),
          jenisKelamin: jenisKelamin as "Laki-laki" | "Perempuan",
          tahunLahir: tahunLahir,
          pendidikan: correctPendidikan,
          statusMondok: correctStatusMondok,
          namaAyah: row["Nama Ayah"] ? row["Nama Ayah"].toString().trim() : '',
          statusAyah: statusAyah as "jm" | "hum" | "",
          namaIbu: row["Nama Ibu"] ? row["Nama Ibu"].toString().trim() : '',
          statusIbu: statusIbu as "jm" | "hum" | "",
          desa: currentUser?.desa || '',
          kelompok: currentUser?.kelompok || ''
        };
      });

      dismissToast(toastId);
      const success = await onImport(validatedData);
      if (success) {
        showSuccess(`Berhasil mengimpor ${validatedData.length} data generus.`);
        setFile(null);
        onClose();
      }
    } catch (error: any) {
      dismissToast(toastId);
      console.error("Error importing Excel:", error);
      if (error.message) {
        showError(error.message);
      } else {
        showError("Gagal mengimpor file. Pastikan format file sesuai dengan template.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Data Generus dari Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan banyak data generus sekaligus. Pastikan file mengikuti template yang telah disediakan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {file ? file.name : 'Seret file ke sini atau klik untuk memilih'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Format yang didukung: .xlsx, .xls
                </p>
              </div>
            </div>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{file.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFile(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file}
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}