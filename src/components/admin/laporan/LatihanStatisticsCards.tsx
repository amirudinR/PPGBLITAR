import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle, Clock, Calendar } from 'lucide-react';

interface LatihanStatistics {
    total: number;
    tercapai: number;
    dalamProses: number;
    persentaseTercapai: number;
}

interface LatihanStatisticsCardsProps {
    stats: LatihanStatistics;
}

export default function LatihanStatisticsCards({ stats }: LatihanStatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-1)), hsl(var(--stat-2)))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Latihan</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <Target className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-3)), hsl(var(--stat-3) / 0.8))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Tercapai</p>
                            <p className="text-3xl font-bold">{stats.tercapai}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-4)), hsl(var(--stat-4) / 0.8))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Dalam Proses</p>
                            <p className="text-3xl font-bold">{stats.dalamProses}</p>
                        </div>
                        <Clock className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-6)), hsl(var(--stat-5)))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Persentase</p>
                            <p className="text-3xl font-bold">{stats.persentaseTercapai}%</p>
                        </div>
                        <Calendar className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
