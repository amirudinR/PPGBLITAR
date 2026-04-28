export interface Desa {
  id: string;
  name: string;
}

export interface Kelompok {
  id: string;
  name: string;
  desaId: string;
  desaName: string;
}
