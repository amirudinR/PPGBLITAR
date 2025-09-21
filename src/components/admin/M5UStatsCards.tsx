import React, { useMemo } from 'react';
import { M5U } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface M5UStatsCardsProps {
  m5uItems: M5U[];
}

export default function M5UStatsCards({ m5uItems }: M5UStatsCardsProps) {
  const stats = useMemo(() => {
    const statusCounts = {
      'Terlaksana': 0,
      'Dalam Proses': 0,
      'Belum Terlaksana': 0,
      'Mansuh': 0,
    };

    m5uItems.forEach(item => {
      if (item.statusHasil && statusCounts.hasOwnProperty(item.statusHasil)) {
        statusCounts[item.statusHasil as keyof typeof statusCounts]++;
      }
    });

    const total = m5uItems.length;
    return Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }, [m5uItems]);

  // Filter out "Dalam Proses" card
  const filteredStats = stats.filter(stat => stat.name !== 'Dalam Proses');

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-${filteredStats.length} mb-6`}>
      {filteredStats.map((stat) => {
        let bgColor = '';
        switch (stat.name) {
          case 'Terlaksana':
            bgColor = 'from-green-500 to-emerald-600';
            break;
          case 'Belum Terlaksana':
            bgColor = 'from-amber-500 to-orange-600';
            break;
          case 'Mansuh':
            bgColor = 'from-rose-500 to-pink-600';
            break;
          default:
            bgColor = 'from-blue-500 to-indigo-600';
        }
        
        return (
          <Card key={stat.name} className={`bg-gradient-to-br ${bgColor} text-white`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <Progress value={stat.percentage} className="mt-2 bg-white/30" />
              <div className="text-xs mt-1">{stat.percentage}%</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}