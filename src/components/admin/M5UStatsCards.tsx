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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terlaksana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.find(s => s.name === 'Terlaksana')?.count || 0}</div>
          <Progress value={stats.find(s => s.name === 'Terlaksana')?.percentage || 0} className="mt-2 bg-green-300" />
          <div className="text-xs mt-1">{stats.find(s => s.name === 'Terlaksana')?.percentage || 0}%</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.find(s => s.name === 'Dalam Proses')?.count || 0}</div>
          <Progress value={stats.find(s => s.name === 'Dalam Proses')?.percentage || 0} className="mt-2 bg-blue-300" />
          <div className="text-xs mt-1">{stats.find(s => s.name === 'Dalam Proses')?.percentage || 0}%</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Belum Terlaksana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.find(s => s.name === 'Belum Terlaksana')?.count || 0}</div>
          <Progress value={stats.find(s => s.name === 'Belum Terlaksana')?.percentage || 0} className="mt-2 bg-amber-300" />
          <div className="text-xs mt-1">{stats.find(s => s.name === 'Belum Terlaksana')?.percentage || 0}%</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mansuh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.find(s => s.name === 'Mansuh')?.count || 0}</div>
          <Progress value={stats.find(s => s.name === 'Mansuh')?.percentage || 0} className="mt-2 bg-rose-300" />
          <div className="text-xs mt-1">{stats.find(s => s.name === 'Mansuh')?.percentage || 0}%</div>
        </CardContent>
      </Card>
    </div>
  );
}