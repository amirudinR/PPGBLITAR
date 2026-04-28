import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

interface M5UHeaderProps {
  onBack: () => void;
  onPrint: () => void;
}

export default function M5UHeader({ onBack, onPrint }: M5UHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-bold">Detail Agenda M5U</h1>
      <Button variant="outline" size="icon" onClick={onPrint} className="ml-auto">
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  );
}
