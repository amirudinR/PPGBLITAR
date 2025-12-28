import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useM5U } from '@/hooks/useM5U';
import { User } from '@/types/admin';

// Search fields configuration
const searchFields = [
  { value: 'agenda', label: 'Agenda' },
  { value: 'hasil', label: 'Hasil' },
  { value: 'pj', label: 'Penanggung Jawab' },
];

interface M5USearchPageProps {
  currentUser: User | null;
}

export default function M5USearchPage({ currentUser }: M5USearchPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('agenda');

  const { m5uItems, loading } = useM5U(currentUser);

  const filteredResults = useMemo(() => {
    if (!searchTerm) return m5uItems;

    return m5uItems.filter(item => {
      const fieldValue = item[searchField as keyof typeof item];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [searchTerm, searchField, m5uItems]);

  if (loading) {
    return <div className="p-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Cari Hasil M5U</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Cari Berdasarkan</label>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih field pencarian" />
                </SelectTrigger>
                <SelectContent>
                  {searchFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Kata Kunci</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Masukkan kata kunci..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead>Hasil</TableHead>
                    <TableHead>Penanggung Jawab</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.bulan}</TableCell>
                      <TableCell>{item.tahun}</TableCell>
                      <TableCell>{item.agenda}</TableCell>
                      <TableCell>{item.hasil}</TableCell>
                      <TableCell>{item.pj}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.statusHasil === 'Terlaksana'
                            ? 'bg-green-500/20 text-green-800'
                            : item.statusHasil === 'Dalam Proses'
                              ? 'bg-blue-500/20 text-blue-800'
                              : item.statusHasil === 'Belum Terlaksana'
                                ? 'bg-yellow-500/20 text-yellow-800'
                                : 'bg-red-500/20 text-red-800'
                          }`}>
                          {item.statusHasil}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Tidak ada hasil yang ditemukan untuk kata kunci tersebut.'
                : 'Gunakan filter di atas untuk mencari hasil M5U.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}