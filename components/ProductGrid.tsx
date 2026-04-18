"use client"

import { Search } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import { ProductModal } from "@/components/ProductModal"
import { Pagination } from "@/components/Pagination"
import { useModalHistory } from "@/hooks/useModalHistory"
import type { Product } from "@/types/product"

function ProductSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  const count = viewMode === "grid" ? 8 : 4
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 px-1 sm:px-0"
          : "space-y-2 sm:space-y-4"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl border border-gray-100 bg-white overflow-hidden ${
            viewMode === "list" ? "flex gap-4 p-3" : ""
          }`}
        >
          <div className={`bg-gray-200 ${
            viewMode === "grid" ? "aspect-square w-full" : "w-24 h-24 rounded-lg shrink-0"
          }`} />
          <div className={`p-3 flex-1 space-y-2 ${viewMode === "list" ? "p-0 py-1" : ""}`}>
            <div className="h-3 bg-gray-200 rounded-full w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
            <div className="h-4 bg-gray-200 rounded-full w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ProductGridProps {
  products: Product[]
  totalProducts: number
  viewMode: "grid" | "list"
  onAddToCart: (productId: number, quantity?: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function ProductGrid({
  products,
  totalProducts,
  viewMode,
  onAddToCart,
  currentPage,
  totalPages,
  onPageChange,
  loading,
 }: ProductGridProps) {
  const { selectedItem: selectedProduct, isOpen, openModal, closeModal } = useModalHistory<Product>()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Loading */}
      {loading ? (
        <ProductSkeleton viewMode={viewMode} />
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-permay-primary/10 shadow-sm">
          <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
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
