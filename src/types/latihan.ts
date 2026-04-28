export const JENIS_LATIHAN_LIST = [
  'Sholat Berjamaah',
  'Tilawah Al-Quran',
  'Puasa Sunnah',
  'Sholat Tahajud',
  'Sholat Dhuha',
  'Dzikir Pagi/Petang',
  'Sedekah',
  'Membaca Buku Islami',
  'Menghafal Al-Quran',
  'Lainnya'
] as const;
export type JenisLatihan = typeof JENIS_LATIHAN_LIST[number];

export interface LatihanASAD {
  id: string;
  generusId: string;
  generusName: string;
  jenisLatihan: JenisLatihan;
  tanggal: string; // YYYY-MM-DD
  bulan: string;
  tahun: number;
  keterangan: string;
  status: 'Tercapai' | 'Tidak Tercapai' | 'Dalam Proses';
  desa: string;
  kelompok: string;
  createdBy: string;
}
