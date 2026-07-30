import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  isPrimary?: boolean;
  subtitle?: string;
}

export default function DashboardStatCard({ title, value, icon: Icon, isPrimary = false, subtitle }: DashboardStatCardProps) {
  if (isPrimary) {
    return (
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[hsl(218,78%,26%)] via-[hsl(218,75%,22%)] to-[hsl(200,85%,38%)] text-white shadow-xl shadow-primary/15 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">{title}</span>
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-4xl font-extrabold tracking-tight text-white">{value}</div>
          {subtitle && <p className="text-xs text-slate-200/90 mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 bg-card border border-border/60 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-foreground tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}