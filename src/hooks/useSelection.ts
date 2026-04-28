import { useState, useCallback } from 'react';

export function useSelection<T extends { id: string }>(selectableItems: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allPageSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        selectableItems.forEach((item) => next.delete(item.id));
      } else {
        selectableItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [allPageSelected, selectableItems]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const selectedCount = selectedIds.size;

  return {
    selectedIds,
    allPageSelected,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    isSelected,
    selectedCount,
  };
}
