"use client"

import { useState } from "react"
import { Grid, List, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "@/components/ProductCard"
import { ProductModal } from "@/components/ProductModal"
import { Pagination } from "@/components/Pagination"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  totalProducts: number
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  sortBy: string
  setSortBy: (sort: string) => void
  onAddToCart: (productId: number, quantity?: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductGrid({
  products,
  totalProducts,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onAddToCart,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{totalProducts} productos</Badge>

            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="brand">Marca</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o el término de búsqueda</p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={setSelectedProduct}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
