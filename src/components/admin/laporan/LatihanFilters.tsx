import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface LatihanFiltersProps {
    searchTerm: string;
    filterMonth: string;
    filterStatus: string;
    onSearchChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    months: string[];
}

export default function LatihanFilters({
    searchTerm,
    filterMonth,
    filterStatus,
    onSearchChange,
    onMonthChange,
    onStatusChange,
    months
}: LatihanFiltersProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Filter Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau jenis latihan..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select value={filterMonth} onValueChange={onMonthChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Bulan</SelectItem>
                            {months.map(month => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="Tercapai">Tercapai</SelectItem>
                            <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                            <SelectItem value="Tidak Tercapai">Tidak Tercapai</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
