export interface M5U {
  id: string;
  bulan: string;
  tahun: number;
  agenda: string;
  hasil: string;
  pj: string;
  waktuPelaksanaan: string;
  statusHasil: 'Terlaksana' | 'Dalam Proses' | 'Belum Terlaksana' | 'Mansuh' | '';
  desa?: string;
  kelompok?: string;
  guruId?: string;
}
