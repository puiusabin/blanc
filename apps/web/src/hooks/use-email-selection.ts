import { useState, useCallback } from "react"
import type { EmailSelection } from "@/types/email"

export function useEmailSelection(): EmailSelection {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  const selectOne = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
        setIsAllSelected(false)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    if (!selected) {
      setSelectedIds(new Set())
    }
    setIsAllSelected(selected)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setIsAllSelected(false)
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        setIsAllSelected(false)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  return {
    selectedIds,
    isAllSelected,
    selectOne,
    selectAll,
    clearSelection,
    toggleSelection,
  }
}
