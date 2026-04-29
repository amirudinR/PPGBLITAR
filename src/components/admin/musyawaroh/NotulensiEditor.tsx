import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

interface Props {
  text: string;
  editing: boolean;
  onTextChange: (text: string) => void;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  canEdit: boolean;
}

export default function NotulensiEditor({
  text,
  editing,
  onTextChange,
  onToggleEdit,
  onSave,
  onCancel,
  canEdit,
}: Props) {
  return (
    <div className="space-y-4">
      {editing ? (
        <>
          <Textarea
            className="min-h-[200px]"
            placeholder="Tulis notulensi musyawaroh di sini..."
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />Simpan
            </Button>
            <Button variant="outline" onClick={onCancel}>Batal</Button>
          </div>
        </>
      ) : (
        <>
          {text ? (
            <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm">{text}</div>
          ) : (
            <EmptyState title="Belum ada notulensi" description="Klik tombol edit untuk menambahkan notulensi." />
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onToggleEdit}>
              <Edit className="w-4 h-4 mr-2" />Edit Notulensi
            </Button>
          )}
        </>
      )}
    </div>
  );
}
