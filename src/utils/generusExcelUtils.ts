import * as XLSX from 'xlsx';
import { Generus, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';

export const handleExport = (allGenerus: Generus[]) => {
  const exportData = allGenerus.map(item => ({
    "Nama Generus": item.name,
    "Jenis Kelamin": item.jenisKelamin,
    "Tanggal Lahir": item.tanggalLahir,
    "Tahun Lahir": item.tahunLahir,
    "Pendidikan": item.pendidikan,
    "Jurusan": item.jurusan,
    "Aktivitas": item.aktivitas,
    "Pekerjaan": item.pekerjaan,
    "Status Mondok": item.statusMondok,
    "Tugas": item.tugas,
    "MT": item.mt,
    "Nama Ayah": item.namaAyah,
    "Status Ayah": item.statusAyah,
    "Nama Ibu": item.namaIbu,
    "Status Ibu": item.statusIbu,
    "Desa": item.desa,
    "Kelompok": item.kelompok,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);

  ws['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Generus");
  XLSX.writeFile(wb, "data_generus.xlsx");
};

export const handleDownloadTemplate = () => {
  const JURUSAN_TRIGGERS = ['SMK', 'KULIAH'];

  const templateData = [
    {
      "Nama Generus": "Contoh Nama",
      "Jenis Kelamin": "Laki-laki",
      "Tanggal Lahir": "2006-07-30",
      "Tahun Lahir": 2006,
      "Pendidikan": "SMA 1",
      "Jurusan": "",
      "Aktivitas": "mondok",
      "Pekerjaan": "",
      "Status Mondok": "Tidak Sedang Mondok",
      "Tugas": "",
      "MT": "Belum MT",
      "Nama Ayah": "Nama Ayah",
      "Status Ayah": "jm",
      "Nama Ibu": "Nama Ibu",
      "Status Ibu": "hum",
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  ws['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
  ];

  // Default values in cells
  const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const defaultValues: Record<number, string> = {
      1: 'Laki-laki', // Jenis Kelamin (B)
      4: 'SMA 1',     // Pendidikan (E)
      8: 'Tidak Sedang Mondok', // Status Mondok (I)
      11: 'Belum MT', // MT (L)
      13: 'jm',       // Status Ayah (N)
      15: 'hum',      // Status Ibu (P)
    };
    for (const [col, val] of Object.entries(defaultValues)) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: parseInt(col) });
      if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
      ws[cellRef].v = val;
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

  // Hidden sheet for dropdowns
  const hiddenSheetData = [
    ["Laki-laki", "Perempuan"],
    ...PENDIDIKAN_LIST.map(item => [item]),
    ...STATUS_MONDOK_LIST.map(item => [item]),
  ];

  const hiddenWs = XLSX.utils.aoa_to_sheet(hiddenSheetData);
  XLSX.utils.book_append_sheet(wb, hiddenWs, "DropdownLists");

  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Sheets = wb.Workbook.Sheets || [];
  wb.Workbook.Sheets[wb.SheetNames.indexOf("DropdownLists")] = { Hidden: 1 };

  ws['!dataValidation'] = {
    'B2:B1000': {
      type: 'list', allowBlank: true,
      formulae: ['DropdownLists!$A$1:$B$1'],
      showErrorMessage: true, errorTitle: 'Invalid Value',
      error: 'Pilih dari dropdown'
    },
    'E2:E1000': {
      type: 'list', allowBlank: true,
      formulae: [`DropdownLists!$A$2:$A$${PENDIDIKAN_LIST.length + 1}`],
      showErrorMessage: true, errorTitle: 'Invalid Value',
      error: 'Pilih dari dropdown'
    },
    'I2:I1000': {
      type: 'list', allowBlank: true,
      formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + 2}:$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 1}`],
      showErrorMessage: true, errorTitle: 'Invalid Value',
      error: 'Pilih dari dropdown'
    },
    'N2:N1000': {
      type: 'list', allowBlank: true,
      formulae: ['DropdownLists!$A$1:$B$1'],
      showErrorMessage: true, errorTitle: 'Invalid Value',
      error: 'Pilih dari dropdown'
    },
    'P2:P1000': {
      type: 'list', allowBlank: true,
      formulae: ['DropdownLists!$A$1:$B$1'],
      showErrorMessage: true, errorTitle: 'Invalid Value',
      error: 'Pilih dari dropdown'
    },
  };

  XLSX.writeFile(wb, "template_import_data_generus.xlsx");
};
