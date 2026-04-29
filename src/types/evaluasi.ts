export type SemesterType = 'ganjil' | 'genap';
export type EvaluasiStatus = 'draft' | 'reviewed' | 'published';

export interface AspekKepribadian {
  akhlak: number;
  kedisiplinan: number;
  kemandirian: number;
  kerjasama: number;
  catatanAspek?: string;
}

export interface EvaluasiMetrics {
  kehadiran: {
    hadir: number;
    total: number;
    persen: number;
  };
  nilai: {
    rataRata: number;
    perMateri: Record<string, number>;
  };
  pencapaianMateri: {
    tercapai: number;
    total: number;
    persen: number;
  };
  keaktifanMusyawaroh?: {
    hadir: number;
    total: number;
    persen: number;
  };
  checklistCompletion?: {
    selesai: number;
    total: number;
    persen: number;
  };
}

export interface EvaluasiSemester {
  id: string;
  generusId: string;
  generusName: string;
  kelasId: string;
  desa: string;
  kelompok: string;
  semester: SemesterType;
  tahunAjaran: string;
  periode: {
    startDate: any;
    endDate: any;
  };
  metrics: EvaluasiMetrics;
  aspekKepribadian?: AspekKepribadian;
  catatanGuru?: string;
  rekomendasi?: string;
  status: EvaluasiStatus;
  filledBy?: string;
  filledAt?: any;
  reviewedBy?: string;
  publishedAt?: any;
}

export interface EvaluasiPeriode {
  id: string;
  semester: SemesterType;
  tahunAjaran: string;
  startDate: any;
  endDate: any;
  isOpen: boolean;
  templateAspek?: string[];
}
