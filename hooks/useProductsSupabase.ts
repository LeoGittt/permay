"use client"

import { useState, useEffect, useMemo } from "react"
import { productService } from "@/lib/supabase-services"
import type { Product } from "@/types/product"
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
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    sortBy,
    viewMode,
    currentPage,
  } = filters

  // Cargar marcas y categorías
  useEffect(() => {
    const loadBrandsAndCategories = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          productService.getBrands(),
          productService.getCategories()
        ])
        setBrands(brandsData)
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error loading brands and categories:', err)
      }
    }

    loadBrandsAndCategories()
  }, [])

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    if (!isLoaded) return

    const loadProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        // Preparar filtros para la consulta
        const queryFilters = {
          search: searchTerm || undefined,
          brands: selectedBrands.length > 0 ? selectedBrands : undefined,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          priceRange: priceRange as [number, number],
          limit: PRODUCTS_PER_PAGE,
          offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
          sortBy: sortBy === 'price-asc' ? 'price' : sortBy === 'price-desc' ? 'price' : 'name',
          sortOrder: sortBy === 'price-desc' ? 'desc' as const : 'asc' as const
        }

        const { data, count } = await productService.getProducts(queryFilters)
        setProducts(data)
        setTotalProducts(count)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Error al cargar productos')
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [isLoaded, searchTerm, selectedBrands, selectedCategories, priceRange, sortBy, currentPage])

  // Calcular páginas totales
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

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

  const clearFilters = () => {
    removeFilters()
  }

  // Función para refrescar productos (útil después de crear/editar/eliminar)
  const refreshProducts = async () => {
    setLoading(true)
    try {
      const queryFilters = {
        search: searchTerm || undefined,
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        priceRange: priceRange as [number, number],
        limit: PRODUCTS_PER_PAGE,
        offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
        sortBy: sortBy === 'price-asc' ? 'price' : sortBy === 'price-desc' ? 'price' : 'name',
        sortOrder: sortBy === 'price-desc' ? 'desc' as const : 'asc' as const
      }

      const { data, count } = await productService.getProducts(queryFilters)
      setProducts(data)
      setTotalProducts(count)
    } catch (err) {
      console.error('Error refreshing products:', err)
      setError('Error al actualizar productos')
    } finally {
      setLoading(false)
    }
  }

  return {
    // Datos
    products,
    totalProducts,
    brands,
    categories,
    loading,
    error,
    
    // Estados de filtros
    searchTerm,
    selectedBrands,
    selectedCategories,
    priceRange,
    sortBy,
    viewMode,
    currentPage,
    totalPages,
    
    // Funciones de actualización
    setSearchTerm,
    setSelectedBrands,
    setSelectedCategories,
    setPriceRange,
    setSortBy,
    setViewMode,
    setCurrentPage,
    clearFilters,
    refreshProducts,
    
    // Para compatibilidad con el código existente
    filteredProducts: products,
    paginatedProducts: products
  }
}
