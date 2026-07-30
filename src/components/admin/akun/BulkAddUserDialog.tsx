import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { showError, showLoading, dismissToast } from '@/utils/toast';
import * as XLSX from 'xlsx';
import { ROLES } from '@/types/admin';
import { ROLE_LABELS } from '@/utils/roleHelpers';
import { handleDownloadTemplate } from '@/utils/userExcelUtils';

const VALID_ROLES = ROLES.filter(r => r !== 'adminsuper');

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onImport: (data: any[]) => Promise<boolean>;
  desas: { name: string }[];
  kelompok: { name: string; desaName: string }[];
  currentUser: { role: string; desa?: string; kelompok?: string } | null;
}

export default function BulkAddUserDialog({ open, setOpen, onImport, desas, kelompok, currentUser }: Props) {
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

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

      const desaNames = desas.map(d => d.name.toLowerCase());

      const validatedData: any[] = jsonData.map((row, index) => {
        const rowNum = index + 2;

        if (!row["Nama"] || !row["Nama"].toString().trim()) {
          throw new Error(`Baris ${rowNum}: Nama tidak boleh kosong.`);
        }

        if (!row["Email"] || !row["Email"].toString().trim()) {
          throw new Error(`Baris ${rowNum}: Email tidak boleh kosong.`);
        }

        if (!isValidEmail(row["Email"].toString().trim())) {
          throw new Error(`Baris ${rowNum}: Format email "${row["Email"]}" tidak valid.`);
        }

        if (!row["Password"] || !row["Password"].toString().trim()) {
          throw new Error(`Baris ${rowNum}: Password tidak boleh kosong.`);
        }

        if (row["Password"].toString().length < 6) {
          throw new Error(`Baris ${rowNum}: Password minimal 6 karakter.`);
        }

        const roleInput = row["Peran"] ? row["Peran"].toString().trim().toLowerCase() : '';
        const role = VALID_ROLES.find(r => r.toLowerCase() === roleInput || ROLE_LABELS[r].toLowerCase().includes(roleInput));
        if (!role) {
          throw new Error(`Baris ${rowNum}: Peran "${row["Peran"]}" tidak valid.`);
        }

        let desa = '';
        if (['desa', 'kelompok', 'guru', 'orangtua'].includes(role)) {
          if (currentUser?.role === 'desa' || currentUser?.role === 'kelompok') {
            desa = currentUser.desa || '';
          } else {
            if (!row["Desa"] || !row["Desa"].toString().trim()) {
              throw new Error(`Baris ${rowNum}: Desa tidak boleh kosong untuk peran "${ROLE_LABELS[role]}".`);
            }
            const desaInput = row["Desa"].toString().trim();
            const matchedDesa = desas.find(d => d.name.toLowerCase() === desaInput.toLowerCase());
            if (!matchedDesa) {
              throw new Error(`Baris ${rowNum}: Desa "${row["Desa"]}" tidak ditemukan.`);
            }
            desa = matchedDesa.name;
          }
        }

        let kelompokVal = '';
        if (['kelompok', 'guru', 'orangtua'].includes(role)) {
          if (currentUser?.role === 'kelompok') {
            kelompokVal = currentUser.kelompok || '';
          } else {
            if (!row["Kelompok"] || !row["Kelompok"].toString().trim()) {
              throw new Error(`Baris ${rowNum}: Kelompok tidak boleh kosong untuk peran "${ROLE_LABELS[role]}".`);
            }
            const kelompokInput = row["Kelompok"].toString().trim();
            const matchedKelompok = kelompok.find(k =>
              k.name.toLowerCase() === kelompokInput.toLowerCase() &&
              k.desaName.toLowerCase() === desa.toLowerCase()
            );
            if (!matchedKelompok) {
              throw new Error(`Baris ${rowNum}: Kelompok "${row["Kelompok"]}" tidak ditemukan di desa "${desa}".`);
            }
            kelompokVal = matchedKelompok.name;
          }
        }

        return {
          name: row["Nama"].toString().trim(),
          email: row["Email"].toString().trim(),
          password: row["Password"].toString().trim(),
          role,
          status: 'Active',
          desa,
          kelompok: kelompokVal,
        };
      });

      dismissToast(toastId);
      const success = await onImport(validatedData);
      if (success) {
        setFile(null);
        setOpen(false);
      }
    } catch (error: any) {
      dismissToast(toastId);
      if (error.message) {
        showError(error.message);
      } else {
        showError("Gagal mengimpor file. Pastikan format file sesuai dengan template.");
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Akun dari Excel</DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan banyak akun sekaligus. Download template terlebih dahulu untuk melihat format yang benar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Template
          </Button>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('bulk-file-input')?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {file ? file.name : 'Seret file ke sini atau klik untuk memilih'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Format yang didukung: .xlsx, .xls
                </p>
              </div>
            </div>
            <Input
              id="bulk-file-input"
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="p-3 bg-muted rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Batal</Button>
          <Button onClick={handleImport} disabled={!file}>Import Akun</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
