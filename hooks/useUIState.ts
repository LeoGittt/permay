"use client"

import { useLocalStorage } from "@/hooks/useLocalStorage"

interface UIState {
  isCartOpen: boolean
  isMobileFiltersOpen: boolean
}

const defaultUIState: UIState = {
  isCartOpen: false,
  isMobileFiltersOpen: false,
}

export function useUIState() {
  const [uiState, setUIState, , isLoaded] = useLocalStorage<UIState>("permay-ui-state", defaultUIState)

  const setIsCartOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isCartOpen: isOpen }))
  }

  const setIsMobileFiltersOpen = (isOpen: boolean) => {
    setUIState(prev => ({ ...prev, isMobileFiltersOpen: isOpen }))
  }

  return {
    isCartOpen: uiState.isCartOpen,
    setIsCartOpen,
    isMobileFiltersOpen: uiState.isMobileFiltersOpen,
    setIsMobileFiltersOpen,
  }
}
