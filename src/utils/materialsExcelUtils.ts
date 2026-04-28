import * as XLSX from 'xlsx';
import { Material, JUDUL_MATERI_LIST, KELAS_MATERI_LIST } from '@/types/admin';

const findCorrectCase = (list: readonly string[], value: string): string | undefined => {
  const lowercasedValue = value.trim().toLowerCase();
  return list.find(item => item.toLowerCase() === lowercasedValue);
};

export const handleDownloadTemplate = () => {
  const headers = ["Judul Materi", "Rincian Materi", "Kelas", "Semester", "Target Bulan"];
  const exampleData = [
    ["Hafalan Al-Quran", "Surat An-Nas ayat 1-3", "SD 1", "Ganjil", "Juli, Agustus"],
    ["Praktik Ibadah", "Tata cara wudhu yang benar", "SD 2", "Genap", "Februari"],
    ["Keilmuan dan Kefahaman", "Rukun Iman", "SMP 1", "Ganjil", "Agustus, September, Oktober"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
  ws['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Materi");
  XLSX.writeFile(wb, "template_upload_materi.xlsx");
};

export const handleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  onAddMultipleMaterials: (materials: Omit<Material, 'id'>[]) => Promise<boolean>,
  onClose?: () => void
) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];
      const materialsToUpload: Omit<Material, 'id'>[] = json.map((row, index) => {
        const rowNum = index + 2;
        const judulMateriRaw = row['Judul Materi'];
        if (!judulMateriRaw) throw new Error(`Baris ${rowNum}: Judul Materi tidak boleh kosong.`);
        const correctJudulMateri = findCorrectCase(JUDUL_MATERI_LIST, String(judulMateriRaw));
        if (!correctJudulMateri) throw new Error(`Baris ${rowNum}: Judul Materi "${judulMateriRaw}" tidak valid.`);
        const kelasRaw = row['Kelas'];
        if (!kelasRaw) throw new Error(`Baris ${rowNum}: Kelas tidak boleh kosong.`);
        const correctKelas = findCorrectCase(KELAS_MATERI_LIST, String(kelasRaw));
        if (!correctKelas) throw new Error(`Baris ${rowNum}: Kelas "${kelasRaw}" tidak valid.`);
        const semesterRaw = row['Semester'];
        if (!semesterRaw) throw new Error(`Baris ${rowNum}: Semester tidak boleh kosong.`);
        const correctSemester = findCorrectCase(['Ganjil', 'Genap'], String(semesterRaw));
        if (!correctSemester) throw new Error(`Baris ${rowNum}: Semester "${semesterRaw}" harus 'Ganjil' atau 'Genap'.`);
        return {
          judulMateri: correctJudulMateri as any,
          rincianMateri: String(row['Rincian Materi'] || '').trim(),
          kelas: correctKelas as any,
          semester: correctSemester as 'Ganjil' | 'Genap',
          targetBulan: String(row['Target Bulan'] || '').split(',').map(s => s.trim()).filter(Boolean),
        };
      });
      onAddMultipleMaterials(materialsToUpload).then(success => { if (success && onClose) onClose(); });
    } catch (error: any) {
      const { showError } = require('@/utils/toast');
      showError(error.message || "Gagal memproses file Excel. Pastikan formatnya benar.");
    }
  };
  reader.readAsArrayBuffer(file);
};
