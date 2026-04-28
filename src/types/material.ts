export const KELAS_MATERI_LIST = [
  'Paud/TK',
  'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6',
  'SMP 1', 'SMP 2', 'SMP 3',
  'SMA 1', 'SMA 2', 'SMA 3',
] as const;
export type KelasMateri = typeof KELAS_MATERI_LIST[number];

export const JUDUL_MATERI_LIST = [
  'Hafalan Al-Quran',
  "Hafalan Do'a",
  'Hafalan Dalil',
  'Praktik Ibadah',
  'Keilmuan dan Kefahaman',
  'Akhlaq',
  'Tata Krama',
  'Kemandirian'
] as const;
export type JudulMateri = typeof JUDUL_MATERI_LIST[number];

export interface Material {
  id: string;
  judulMateri: JudulMateri;
  rincianMateri: string;
  kelas: KelasMateri;
  semester: 'Ganjil' | 'Genap';
  targetBulan: string[];
}

export const SEMESTER_GANJIL_MONTHS = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'] as const;
export const SEMESTER_GENAP_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'] as const;
