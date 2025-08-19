"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { FilterCards } from "@/components/FilterCards"
import { ProductGrid } from "@/components/ProductGrid"
import { Cart } from "@/components/Cart"
import { WhatsAppFloat } from "@/components/WhatsAppFloat"
import { useProducts } from "@/hooks/useProductsSupabase"
import { useCart } from "@/hooks/useCart"
import { useCartWithSupabase } from "@/hooks/useCartWithSupabase"
import { useUIState } from "@/hooks/useUIState"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

export default function PermayHome() {

  const { isCartOpen, setIsCartOpen, isMobileFiltersOpen, setIsMobileFiltersOpen } = useUIState()

  const {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedBrands,
    setSelectedBrands,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    brands,
    categories,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProducts,
  } = useProducts();

  // Limpiar el término de búsqueda al cargar la página
  useEffect(() => {
    setSearchTerm("");
  }, []);

  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCartWithSupabase()

  // Calcular filtros activos
  const activeFiltersCount = selectedBrands.length + selectedCategories.length + 
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={getCartItemsCount()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 lg:gap-6">


          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Filtros mejorados arriba de la grilla */}
            <FilterCards
              brands={brands}
              categories={categories}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClearFilters={clearFilters}
            />

            <ProductGrid
              products={paginatedProducts}
              totalProducts={filteredProducts.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onAddToCart={addToCart}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </div>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        total={getCartTotal()}
      />

      {/* WhatsApp Float Button */}
      <WhatsAppFloat />
    </div>
  )
}
