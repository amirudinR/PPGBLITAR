import React from 'react';
import { AspekKepribadian } from '@/types/evaluasi';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

const ASPEK_LABELS: Record<keyof Omit<AspekKepribadian, 'catatanAspek'>, string> = {
  akhlak: 'Akhlak',
  kedisiplinan: 'Kedisiplinan',
  kemandirian: 'Kemandirian',
  kerjasama: 'Kerjasama',
};

interface Props {
  aspek: AspekKepribadian;
  onChange: (aspek: AspekKepribadian) => void;
  canEdit: boolean;
  isOrangtua: boolean;
  isPublished: boolean;
}

export default function AspekKepribadianForm({
  aspek,
  onChange,
  canEdit,
  isOrangtua,
  isPublished,
}: Props) {
  return (
    <div>
      <h4 className="font-semibold mb-3">Aspek Kepribadian</h4>
      <div className="space-y-4">
        {(Object.keys(ASPEK_LABELS) as (keyof typeof ASPEK_LABELS)[]).map((key) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <Label>{ASPEK_LABELS[key]}</Label>
              <span className="text-sm font-medium">{aspek[key]}/5</span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[aspek[key]]}
              onValueChange={([v]) => onChange({ ...aspek, [key]: v })}
              disabled={!canEdit || isOrangtua || isPublished}
            />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Label>Catatan Aspek</Label>
        <Textarea
          className="mt-1"
          value={aspek.catatanAspek ?? ''}
          onChange={(e) => onChange({ ...aspek, catatanAspek: e.target.value })}
          disabled={!canEdit || isOrangtua || isPublished}
        />
      </div>
    </div>
  );
}
