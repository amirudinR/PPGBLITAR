export interface Generus {
  id: string;
  name: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tahunLahir: number;
  namaAyah: string;
  namaIbu: string;
  desa: string;
  kelompok: string;
}

export interface Material {
  id: string;
  title: string;
  date: string;
  bacaan: string;
  menulis: string;
  hafalan: string;
  praktekIbadah: string;
  keilmuan: string;
  tatakrama: string;
  kemandirian: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface Attendance {
  id: string;
  studentName: string;
  date: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
}