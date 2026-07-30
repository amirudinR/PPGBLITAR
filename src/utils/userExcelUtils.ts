import * as XLSX from 'xlsx';
import { ROLES } from '@/types/admin';
import { ROLE_LABELS } from '@/utils/roleHelpers';

const VALID_ROLES = ROLES.filter(r => r !== 'adminsuper');

export const handleDownloadTemplate = () => {
  const templateData = [
    {
      "Peran": "guru",
      "Desa": "Contoh Desa",
      "Kelompok": "Contoh Kelompok",
      "Nama": "Contoh Nama",
      "Email": "contoh@email.com",
      "Password": "password123",
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  ws['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
  ];

  VALID_ROLES.forEach((role) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: 'Peran' };
  });

  XLSX.utils.book_append_sheet(wb, ws, "Data Akun");

  const hiddenSheetData = VALID_ROLES.map(role => [role]);
  const hiddenWs = XLSX.utils.aoa_to_sheet(hiddenSheetData);
  XLSX.utils.book_append_sheet(wb, hiddenWs, "DropdownLists");

  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Sheets = wb.Workbook.Sheets || [];
  wb.Workbook.Sheets[wb.SheetNames.indexOf("DropdownLists")] = { Hidden: 1 };

  ws['!dataValidation'] = {
    'A2:A1000': {
      type: 'list',
      allowBlank: true,
      formulae: [`DropdownLists!$A$1:$A$${VALID_ROLES.length}`],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Pilih peran yang valid dari dropdown'
    },
  };

  XLSX.writeFile(wb, "template_import_akun.xlsx");
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const handleFileUpload = (
  file: File,
  onImport: (data: Omit<any, 'id'>[]) => Promise<boolean>,
  onClose: () => void,
  desas: { name: string }[],
  kelompok: { name: string; desaName: string }[],
  currentUser: { role: string; desa?: string; kelompok?: string } | null,
) => {
  return async () => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const desaNames = desas.map(d => d.name.toLowerCase());
      const kelompokNames = kelompok.map(k => ({ name: k.name.toLowerCase(), desaName: k.desaName.toLowerCase() }));

      const validatedData: Omit<any, 'id'>[] = jsonData.map((row, index) => {
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
        const role = ROLES_LIST.find(r => r.toLowerCase() === roleInput || ROLE_LABELS[r].toLowerCase().startsWith(roleInput));
        if (!role) {
          throw new Error(`Baris ${rowNum}: Peran "${row["Peran"]}" tidak valid. Pilihan: ${ROLES_LIST.map(r => ROLE_LABELS[r]).join(', ')}`);
        }

        let desa = '';
        if (['desa', 'kelompok', 'guru', 'orangtua'].includes(role)) {
          if (currentUser?.role === 'desa') {
            desa = currentUser.desa || '';
          } else if (currentUser?.role === 'kelompok') {
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

      const success = await onImport(validatedData);
      if (success) {
        onClose();
      }
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error("Gagal membaca file. Pastikan format sesuai template.");
    }
  };
};
