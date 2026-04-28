import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';
import { SEMESTER_GANJIL_MONTHS, SEMESTER_GENAP_MONTHS } from '@/types/admin';

interface MaterialsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  monthFilter: string[];
  setMonthFilter: (months: string[]) => void;
  searchOptions: string[];
  dropdownCategories: string[];
  filterOptions: Array<{ value: string; label: string }>;
}

const allMonths = [...SEMESTER_GANJIL_MONTHS, ...SEMESTER_GENAP_MONTHS];

export default function MaterialsFilter({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  monthFilter,
  setMonthFilter,
  searchOptions,
  dropdownCategories,
  filterOptions
}: MaterialsFilterProps) {
  const renderSearchInput = () => {
    if (dropdownCategories.includes(filterCategory)) {
      return (
        <Select 
          value={searchTerm} 
          onValueChange={(value) => setSearchTerm(value === '--all--' ? '' : value || '')}
        >
          <SelectTrigger className="w-full flex-grow md:w-[200px]">
            <SelectValue placeholder={`Pilih ${filterOptions.find(f => f.value === filterCategory)?.label}...`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="--all--">Semua</SelectItem>
            {searchOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <div className="relative w-full md:w-auto flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
      {renderSearchInput()}
      <Select value={filterCategory} onValueChange={(value) => {
        setFilterCategory(value);
        setSearchTerm('');
      }}>
        <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>{filterOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Bulan {monthFilter.length > 0 && `(${monthFilter.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {allMonths.map(bulan => (
            <DropdownMenuCheckboxItem key={bulan} checked={monthFilter.includes(bulan)} onCheckedChange={(checked) => setMonthFilter(checked ? [...monthFilter, bulan] : monthFilter.filter(b => b !== bulan))}>
              {bulan}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
