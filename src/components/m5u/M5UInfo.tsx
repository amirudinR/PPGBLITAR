import React from 'react';
import { Label } from "@/components/ui/label";

interface M5UInfoProps {
  bulan: string | undefined;
  tahun: string | undefined;
  canAdd: boolean;
  onAdd: () => void;
}

export default function M5UInfo({ bulan, tahun, canAdd, onAdd }: M5UInfoProps) {
  return (
    <div className="bg-card rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="font-semibold">Bulan</Label>
          <p className="text-lg">{bulan}</p>
        </div>
        <div>
          <Label className="font-semibold">Tahun</Label>
          <p className="text-lg">{tahun}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Daftar Agenda</h2>
        {canAdd && (
          <button onClick={onAdd} className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Agenda
          </button>
        )}
      </div>
    </div>
  );
}
