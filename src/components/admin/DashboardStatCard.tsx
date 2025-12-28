import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
}

export default function DashboardStatCard({ title, value, icon: Icon }: DashboardStatCardProps) {
  // Generate a unique gradient for each card based on title
  const getGradient = () => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
      'from-violet-500 to-fuchsia-500'
    ];
    
    const index = title.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <Card className={`bg-gradient-to-br ${getGradient()} text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-card bg-opacity-20 rounded-full">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </CardContent>
    </Card>
  );
}