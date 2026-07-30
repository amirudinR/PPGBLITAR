import React from 'react';
import { User, GENERUS_FILTER_FIELDS } from '@/types/admin';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

interface GenerusFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  currentUser: User | null;
}

const dropdownCategories = ['tahunLahir', 'pendidikan', 'aktivitas', 'statusMondok', 'mt', 'desa', 'kelompok'];

export default function GenerusFilters({
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  currentUser
}: GenerusFiltersProps) {
  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => onSearchChange(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-full flex-grow md:w-[220px] rounded-2xl border-border/80 bg-card text-xs font-medium shadow-xs">
            <SelectValue placeholder={`Pilih ${GENERUS_FILTER_FIELDS.find(f => f.value === filterCategory)?.label}...`} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="--all--">Semua</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari nama, desa, kelompok..." 
          className="pl-10 rounded-2xl border-border/80 bg-card text-xs font-medium shadow-xs"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        {renderSearchInput()}
        <Select value={filterCategory} onValueChange={(value) => {
          onFilterCategoryChange(value);
          onSearchChange('');
        }}>
          <SelectTrigger className="w-[180px] flex-shrink-0 rounded-2xl border-border/80 bg-card text-xs font-medium shadow-xs">
            <SelectValue placeholder="Filter Berdasarkan" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {GENERUS_FILTER_FIELDS.map(field => (
              <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}