import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDown } from 'lucide-react';
import { OperationalFlow } from './types';

interface Props {
  flow: OperationalFlow;
}

export default function FlowDiagram({ flow }: Props) {
  return (
    <div className="space-y-3">
      {flow.steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <React.Fragment key={idx}>
            <div className={`flex items-start gap-3 rounded-lg border ${step.color} p-3`}>
              <div className="shrink-0 mt-0.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background/80 shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{step.actor}</p>
                <p className="text-sm text-foreground/80">{step.action}</p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0 self-center">{idx + 1}</Badge>
            </div>
            {idx < flow.steps.length - 1 && (
              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
