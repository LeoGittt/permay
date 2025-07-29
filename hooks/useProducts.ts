"use client"

import { useMemo } from "react"
import { products } from "@/data/products"
import { useLocalStorage } from "@/hooks/useLocalStorage"

const PRODUCTS_PER_PAGE = 12

interface FilterState {
  searchTerm: string
  selectedBrands: string[]
  selectedCategories: string[]
  priceRange: number[]
  sortBy: string
  viewMode: "grid" | "list"
  currentPage: number
}

const defaultFilters: FilterState = {
  searchTerm: "",
  selectedBrands: [],
  selectedCategories: [],
  priceRange: [0, 100000],
  sortBy: "name",
  viewMode: "grid",
  currentPage: 1,
}

export function useProducts() {
  const [filters, setFilters, removeFilters, isLoaded] = useLocalStorage<FilterState>("permay-filters", defaultFilters)

  const {
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    sortBy,
    viewMode,
    currentPage,
  } = filters

  // Helper functions to update specific filters
  const updateFilter = (key: keyof FilterState, value: any, resetPage = true) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(resetPage && { currentPage: 1 })
    }))
  }

  const setSearchTerm = (term: string) => updateFilter("searchTerm", term)
  const setSelectedBrands = (brands: string[]) => updateFilter("selectedBrands", brands)
  const setSelectedCategories = (categories: string[]) => updateFilter("selectedCategories", categories)
  const setPriceRange = (range: number[]) => updateFilter("priceRange", range)
  const setSortBy = (sort: string) => updateFilter("sortBy", sort)
  const setViewMode = (mode: "grid" | "list") => updateFilter("viewMode", mode, false)
  const setCurrentPage = (page: number) => updateFilter("currentPage", page, false)

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(), [])
  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(), [])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand))
      const matchesCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category))
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesBrand && matchesCategory && matchesPrice
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "brand":
          return (a.brand ?? "").localeCompare(b.brand ?? "")
        default:
          return (a.name ?? "").localeCompare(b.name ?? "")
      }
    })

    return filtered
  }, [searchTerm, selectedBrands, selectedCategories, priceRange, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage])

  // Reset to first page when filters change
  const setSearchTermWithReset = (term: string) => setSearchTerm(term)
  const setSelectedBrandsWithReset = (brands: string[]) => setSelectedBrands(brands)
  const setSelectedCategoriesWithReset = (categories: string[]) => setSelectedCategories(categories)
  const setPriceRangeWithReset = (range: number[]) => setPriceRange(range)
  const setSortByWithReset = (sort: string) => setSortBy(sort)

  const clearFilters = () => {
    removeFilters()
  }

  return {
    filteredProducts,
    paginatedProducts,
    searchTerm,
    setSearchTerm: setSearchTermWithReset,
    selectedBrands,
    setSelectedBrands: setSelectedBrandsWithReset,
    selectedCategories,
    setSelectedCategories: setSelectedCategoriesWithReset,
    priceRange,
    setPriceRange: setPriceRangeWithReset,
    sortBy,
    setSortBy: setSortByWithReset,
    viewMode,
    setViewMode,
    brands,
    categories,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
  }
}
