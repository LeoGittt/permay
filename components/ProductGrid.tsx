"use client"

import { Search } from "lucide-react"
import { ProductCard } from "@/components/ProductCard"
import { ProductModal } from "@/components/ProductModal"
import { Pagination } from "@/components/Pagination"
import { useModalHistory } from "@/hooks/useModalHistory"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  totalProducts: number
  viewMode: "grid" | "list"
  onAddToCart: (productId: number, quantity?: number) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductGrid({
  products,
  totalProducts,
  viewMode,
  onAddToCart,
  currentPage,
  totalPages,
  onPageChange,
 }: ProductGridProps) {
  const { selectedItem: selectedProduct, isOpen, openModal, closeModal } = useModalHistory<Product>()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Products */}
      {products.length === 0 ? (
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
