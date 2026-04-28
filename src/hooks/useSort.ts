import { useState, useCallback, useMemo } from 'react';

interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export function useSort<T>(items: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = useCallback(
    (key: keyof T) => {
      setSortConfig((prev) => {
        if (prev && prev.key === key && prev.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key, direction: 'asc' };
      });
    },
    [],
  );

  const getSortIndicator = useCallback(
    (key: keyof T) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    },
    [sortConfig],
  );

  return {
    sortedItems,
    sortConfig,
    requestSort,
    getSortIndicator,
  };
}
