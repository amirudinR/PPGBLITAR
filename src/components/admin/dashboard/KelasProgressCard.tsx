import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Target } from 'lucide-react';

interface KelasProgressCardProps {
  namaKelas: string;
  jumlahGenerus: number;
  progress: number;
}

export default function KelasProgressCard({ namaKelas, jumlahGenerus, progress }: KelasProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{namaKelas}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{jumlahGenerus} Generus</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            <span>Target Bulan Ini</span>
          </div>
        </div>
        <div>
          <Progress value={progress} className="w-full" />
          <p className="text-right text-sm font-bold mt-1">{progress}%</p>
        </div>
      </CardContent>
    </Card>
  );
}