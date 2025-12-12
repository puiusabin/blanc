import { useState, useCallback } from "react";

export interface ThreadSelection {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  selectOne: (id: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
}

export function useThreadSelection(): ThreadSelection {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  const selectOne = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
        setIsAllSelected(false);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    if (!selected) {
      setSelectedIds(new Set());
    }
    setIsAllSelected(selected);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        setIsAllSelected(false);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return {
    selectedIds,
    isAllSelected,
    selectOne,
    selectAll,
    clearSelection,
    toggleSelection,
  };
}
