"use client"

import { useState, useMemo } from "react"
import { products } from "@/data/products"

const PRODUCTS_PER_PAGE = 12

export function useProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

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
  const setSearchTermWithReset = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const setSelectedBrandsWithReset = (brands: string[]) => {
    setSelectedBrands(brands)
    setCurrentPage(1)
  }

  const setSelectedCategoriesWithReset = (categories: string[]) => {
    setSelectedCategories(categories)
    setCurrentPage(1)
  }

  const setPriceRangeWithReset = (range: number[]) => {
    setPriceRange(range)
    setCurrentPage(1)
  }

  const setSortByWithReset = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedBrands([])
    setSelectedCategories([])
    setPriceRange([0, 100000])
    setSearchTerm("")
    setCurrentPage(1)
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
