import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
}

export default function DashboardStatCard({ title, value, icon: Icon }: DashboardStatCardProps) {
  const getStatVar = () => {
    const statVars = ['--stat-1', '--stat-2', '--stat-3', '--stat-4', '--stat-5', '--stat-6'];
    const index = title.charCodeAt(0) % statVars.length;
    return statVars[index];
  };

  const statVar = getStatVar();

  return (
    <Card
      className="neu-stat transition-all duration-200"
      style={{ color: `hsl(var(${statVar}))` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className="p-2 rounded-full bg-[hsl(var(${statVar}) / 0.12)]">
          <Icon className="h-4 w-4" style={{ color: `hsl(var(${statVar}))` }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mt-2" style={{ color: `hsl(var(${statVar}))` }}>{value}</div>
      </CardContent>
    </Card>
  );
}