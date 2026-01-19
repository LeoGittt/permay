"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { FilterCards } from "@/components/FilterCards"
import { ProductGrid } from "@/components/ProductGrid"
import { StoreGallery } from "@/components/StoreGallery"
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
    showOffers,
    setShowOffers,
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
    <div className="min-h-screen relative bg-white overflow-hidden">
      {/* Fondo decorativo con gradientes y orbes */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-permay-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-permay-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] w-[30%] h-[30%] rounded-full bg-[#D84AE8]/5 blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-permay-primary/[0.02]" />
      </div>

      <div className="relative z-10">
      <Header
        cartItemsCount={getCartItemsCount()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-6">
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
              showOffers={showOffers}
              setShowOffers={setShowOffers}
              onClearFilters={clearFilters}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              products={filteredProducts}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            <ProductGrid
              products={paginatedProducts}
              totalProducts={filteredProducts.length}
              viewMode={viewMode}
              onAddToCart={addToCart}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </div>

      {/* Galería del local */}
      <StoreGallery />

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
    </div>
  )
}
