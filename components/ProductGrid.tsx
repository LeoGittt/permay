"use client"

import { Grid, List, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "@/components/ProductCard"
import { ProductModal } from "@/components/ProductModal"
import { Pagination } from "@/components/Pagination"
import { Badge } from "@/components/ui/badge"
import { useModalHistory } from "@/hooks/useModalHistory"
import { cn } from "@/lib/utils"
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
  const { selectedItem: selectedProduct, isOpen, openModal, closeModal } = useModalHistory<Product>()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-permay-primary/10 p-2 sm:p-3 shadow-sm">
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 border border-gray-100 p-0.5 rounded-lg bg-gray-50/50">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(
                "w-8 h-8 rounded-md transition-all",
                viewMode === "grid" ? "bg-permay-primary text-white shadow-sm" : "text-gray-400 hover:text-permay-primary"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(
                "w-8 h-8 rounded-md transition-all",
                viewMode === "list" ? "bg-permay-primary text-white shadow-sm" : "text-gray-400 hover:text-permay-primary"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] sm:w-48 h-9 text-xs sm:text-sm border-gray-100 bg-gray-50/50 focus:ring-permay-primary/20 rounded-lg">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl border-gray-100">
              <SelectItem value="name" className="text-xs sm:text-sm">Nombre A-Z</SelectItem>
              <SelectItem value="brand" className="text-xs sm:text-sm">Marca</SelectItem>
              <SelectItem value="price-asc" className="text-xs sm:text-sm">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc" className="text-xs sm:text-sm">Precio: Mayor a Menor</SelectItem>
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
              viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 px-1 sm:px-0" 
                : "space-y-2 sm:space-y-4"
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetails={openModal}
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
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}
