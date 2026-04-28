import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  colorClass: string;
}

export default function StatCard({ title, value, colorClass }: StatCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <h3 className="text-muted-foreground text-sm">{title}</h3>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}