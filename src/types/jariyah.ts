export const JENIS_JARIYAH_LIST = [
  'Infaq Bulanan',
  'Sedekah',
  'Wakaf',
  'Zakat Maal',
  'Zakat Fitrah',
  'Donasi Pembangunan',
  'Donasi Kegiatan',
  'Lainnya'
] as const;
export type JenisJariyah = typeof JENIS_JARIYAH_LIST[number];

export interface JariyahPPG {
  id: string;
  donaturName: string;
  donaturType: 'Generus' | 'Orang Tua' | 'Umum';
  generusId?: string;
  jenisJariyah: JenisJariyah;
  nominal: number;
  tanggal: string; // YYYY-MM-DD
  bulan: string;
  tahun: number;
  keterangan: string;
  status: 'Diterima' | 'Pending' | 'Ditolak';
  desa: string;
  kelompok: string;
  createdBy: string;
}
