"use client"

import { useState, useEffect } from "react"
import { productService } from "@/lib/supabase-services"
import type { Product } from "@/types/product"

export function useProductsOnSale(limit?: number) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProductsOnSale = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductsOnSale(limit)
      setProducts(data)
    } catch (err) {
      console.error('Error loading products on sale:', err)
      setError('Error al cargar productos en oferta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductsOnSale()
  }, [limit])

  return {
    products,
    loading,
    error,
    refreshProducts: loadProductsOnSale
  }
}
