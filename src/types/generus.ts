export interface Generus {
  id: string;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  tanggalLahir: string;
  pendidikan: Pendidikan;
  jurusan: string;
  aktivitas: '' | 'bekerja' | 'mondok' | 'tugas';
  pekerjaan: string;
  statusMondok: StatusMondok;
  tugas: string;
  mt: 'MT' | 'Belum MT';
  namaAyah: string;
  statusAyah: 'jm' | 'hum' | '';
  namaIbu: string;
  statusIbu: 'jm' | 'hum' | '';
  desa: string;
  kelompok: string;
}

export const PENDIDIKAN_LIST = [
  'Belum sekolah',
  'Paud/TK',
  'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6',
  'SMP 1', 'SMP 2', 'SMP 3',
  'SMA 1', 'SMA 2', 'SMA 3',
  'SMK',
  'Lulus Sekolah',
  'MAHASISWA',
  'KULIAH',
  'Lulus S1', 'Lulus S2', 'Lulus S3'
] as const;
export type Pendidikan = typeof PENDIDIKAN_LIST[number];

export const JENJANG_USIA_LIST = ['Caberawit', 'Pra Remaja', 'Remaja', 'Pra Nikah'] as const;
export type JenjangUsia = typeof JENJANG_USIA_LIST[number];

export const getJenjangUsia = (pendidikan: Pendidikan): JenjangUsia | '-' => {
  switch (pendidikan) {
    case 'Belum sekolah': case 'Paud/TK': case 'SD 1': case 'SD 2': case 'SD 3': case 'SD 4': case 'SD 5': case 'SD 6':
      return 'Caberawit';
    case 'SMP 1': case 'SMP 2': case 'SMP 3':
      return 'Pra Remaja';
    case 'SMA 1': case 'SMA 2': case 'SMA 3': case 'SMK':
      return 'Remaja';
    case 'Lulus Sekolah': case 'MAHASISWA': case 'KULIAH': case 'Lulus S1': case 'Lulus S2': case 'Lulus S3':
      return 'Pra Nikah';
    default:
      return '-';
  }
};

export const STATUS_MONDOK_LIST = [
  'Boarding school di Blitar',
  'Boarding school di luar Blitar',
  'Mubaligh/Mubalighot',
  'Tidak Sedang Mondok',
  'Hadis Besar'
] as const;
export type StatusMondok = typeof STATUS_MONDOK_LIST[number];

export const AKTIVITAS_LIST = ['bekerja', 'mondok', 'tugas'] as const;
export type Aktivitas = typeof AKTIVITAS_LIST[number];

export const GENERUS_FILTER_FIELDS = [
  { value: 'name', label: 'Nama Generus' },
  { value: 'tahunLahir', label: 'Tahun Lahir' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'jenjangUsia', label: 'Jenjang Usia' },
  { value: 'aktivitas', label: 'Aktivitas' },
  { value: 'statusMondok', label: 'Status Mondok' },
  { value: 'mt', label: 'MT' },
  { value: 'desa', label: 'Desa' },
  { value: 'kelompok', label: 'Kelompok' },
  { value: 'namaAyah', label: 'Nama Ayah' },
  { value: 'namaIbu', label: 'Nama Ibu' },
] as const;
