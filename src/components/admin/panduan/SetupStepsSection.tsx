import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SETUP_STEPS } from './constants';

export default function SetupStepsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SETUP_STEPS.map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={step.number} className="relative">
            <div className="rounded-xl border bg-card p-4 h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                  {step.number}
                </div>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-sm font-semibold mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
              <div className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
                <span className="font-medium">Oleh:</span> {step.actor}
              </div>
              <div className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2 py-1 mt-1">
                <span className="font-medium">Cara:</span> {step.detail}
              </div>
            </div>
            {/* Arrow between cards (desktop only) */}
            {idx < SETUP_STEPS.length - 1 && (idx + 1) % 4 !== 0 && (
              <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
