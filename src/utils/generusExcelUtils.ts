import * as XLSX from 'xlsx';
import { Generus, PENDIDIKAN_LIST, STATUS_MONDOK_LIST } from '@/types/admin';

export const handleExport = (allGenerus: Generus[]) => {
  // Siapkan data untuk diekspor
  const exportData = allGenerus.map(item => ({
    "Nama Generus": item.name,
    "Jenis Kelamin": item.jenisKelamin,
    "Tahun Lahir": item.tahunLahir,
    "Pendidikan": item.pendidikan,
    "Status Mondok": item.statusMondok,
    "Nama Ayah": item.namaAyah,
    "Status Ayah": item.statusAyah,
    "Nama Ibu": item.namaIbu,
    "Status Ibu": item.statusIbu
  }));

  // Buat worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Atur lebar kolom
  ws['!cols'] = [
    { wch: 20 }, // Nama Generus
    { wch: 12 }, // Jenis Kelamin
    { wch: 12 }, // Tahun Lahir
    { wch: 15 }, // Pendidikan
    { wch: 25 }, // Status Mondok
    { wch: 15 }, // Nama Ayah
    { wch: 10 }, // Status Ayah
    { wch: 15 }, // Nama Ibu
    { wch: 10 }  // Status Ibu
  ];

  // Buat workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

  // Ekspor file
  XLSX.writeFile(wb, "data_generus.xlsx");
};

export const handleDownloadTemplate = () => {
  // Data contoh untuk template
  const templateData = [
    {
      "Nama Generus": "Contoh Nama",
      "Jenis Kelamin": "Laki-laki",
      "Tahun Lahir": 2010,
      "Pendidikan": "SD 3",
      "Status Mondok": "Tidak Sedang Mondok",
      "Nama Ayah": "Nama Ayah",
      "Status Ayah": "jm",
      "Nama Ibu": "Nama Ibu",
      "Status Ibu": "hum"
    }
  ];

  // Buat workbook
  const wb = XLSX.utils.book_new();
  
  // Buat worksheet dari data contoh
  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Atur lebar kolom
  ws['!cols'] = [
    { wch: 20 }, // Nama Generus
    { wch: 12 }, // Jenis Kelamin
    { wch: 12 }, // Tahun Lahir
    { wch: 15 }, // Pendidikan
    { wch: 25 }, // Status Mondok
    { wch: 15 }, // Nama Ayah
    { wch: 10 }, // Status Ayah
    { wch: 15 }, // Nama Ibu
    { wch: 10 }  // Status Ibu
  ];

  // Tambahkan dropdown untuk kolom Jenis Kelamin
  const jenisKelaminRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = jenisKelaminRange.s.r + 1; rowNum <= jenisKelaminRange.e.r; rowNum++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Kolom B (Jenis Kelamin)
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
    ws[cellRef].v = 'Laki-laki'; // Default value
  }

  // Tambahkan dropdown untuk kolom Pendidikan
  const pendidikanRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = pendidikanRange.s.r + 1; rowNum <= pendidikanRange.e.r; rowNum++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 3 }); // Kolom D (Pendidikan)
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
    ws[cellRef].v = 'SD 3'; // Default value
  }

  // Tambahkan dropdown untuk kolom Status Mondok
  const statusMondokRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = statusMondokRange.s.r + 1; rowNum <= statusMondokRange.e.r; rowNum++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 4 }); // Kolom E (Status Mondok)
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
    ws[cellRef].v = 'Tidak Sedang Mondok'; // Default value
  }

  // Tambahkan dropdown untuk kolom Status Ayah
  const statusAyahRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = statusAyahRange.s.r + 1; rowNum <= statusAyahRange.e.r; rowNum++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 6 }); // Kolom G (Status Ayah)
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
    ws[cellRef].v = 'jm'; // Default value
  }

  // Tambahkan dropdown untuk kolom Status Ibu
  const statusIbuRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
  for (let rowNum = statusIbuRange.s.r + 1; rowNum <= statusIbuRange.e.r; rowNum++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: 8 }); // Kolom I (Status Ibu)
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
    ws[cellRef].v = 'hum'; // Default value
  }

  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

  // Buat worksheet tersembunyi untuk daftar dropdown
  const hiddenSheetData = [
    ["Laki-laki", "Perempuan"], // Jenis Kelamin
    ...PENDIDIKAN_LIST.map(item => [item]), // Pendidikan
    ...STATUS_MONDOK_LIST.map(item => [item]), // Status Mondok
    ["jm", "hum"] // Status Orang Tua
  ];
  
  const hiddenWs = XLSX.utils.aoa_to_sheet(hiddenSheetData);
  XLSX.utils.book_append_sheet(wb, hiddenWs, "DropdownLists");
  
  // Sembunyikan worksheet
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Sheets = wb.Workbook.Sheets || [];
  wb.Workbook.Sheets[wb.SheetNames.indexOf("DropdownLists")] = { Hidden: 1 };

  // Tambahkan validasi data untuk dropdown
  ws['!dataValidation'] = {
    // Jenis Kelamin (kolom B)
    'B2:B1000': {
      type: 'list',
      allowBlank: true,
      formulae: ['DropdownLists!$A$1:$B$1'],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select from the dropdown list'
    },
    // Pendidikan (kolom D)
    'D2:D1000': {
      type: 'list',
      allowBlank: true,
      formulae: [`DropdownLists!$A$2:$A$${PENDIDIKAN_LIST.length + 1}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select from the dropdown list'
    },
    // Status Mondok (kolom E)
    'E2:E1000': {
      type: 'list',
      allowBlank: true,
      formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + 2}:$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 1}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select from the dropdown list'
    },
    // Status Ayah (kolom G)
    'G2:G1000': {
      type: 'list',
      allowBlank: true,
      formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}:$B$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select from the dropdown list'
    },
    // Status Ibu (kolom I)
    'I2:I1000': {
      type: 'list',
      allowBlank: true,
      formulae: [`DropdownLists!$A$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}:$B$${PENDIDIKAN_LIST.length + STATUS_MONDOK_LIST.length + 2}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please select from the dropdown list'
    }
  };

  // Ekspor file template
  XLSX.writeFile(wb, "template_import_data_generus.xlsx");
};
