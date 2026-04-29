import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  onNavigate?: (section: string) => void;
}

export default function HelpButton({ onNavigate }: Props) {
  if (!onNavigate) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onNavigate('panduan')}
          aria-label="Panduan Penggunaan"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Panduan Penggunaan</TooltipContent>
    </Tooltip>
  );
}
