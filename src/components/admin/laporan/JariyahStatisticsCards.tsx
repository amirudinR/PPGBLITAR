import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, PieChart } from 'lucide-react';

interface JariyahStatistics {
    total: number;
    totalNominal: number;
    nominalDiterima: number;
    pending: number;
}

interface JariyahStatisticsCardsProps {
    stats: JariyahStatistics;
    formatCurrency: (amount: number) => string;
}

export default function JariyahStatisticsCards({ stats, formatCurrency }: JariyahStatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-3)), hsl(var(--stat-3) / 0.8))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Jariyah</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <Users className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-1)), hsl(var(--stat-2)))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Nominal</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalNominal)}</p>
                        </div>
                        <DollarSign className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-6)), hsl(var(--stat-5)))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Diterima</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.nominalDiterima)}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="text-white" style={{ background: 'linear-gradient(135deg, hsl(var(--stat-4)), hsl(var(--stat-4) / 0.8))' }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Pending</p>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                        </div>
                        <PieChart className="w-10 h-10 opacity-80" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
