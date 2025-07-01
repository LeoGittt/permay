"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { FilterSidebar } from "@/components/FilterSidebar"
import { ProductGrid } from "@/components/ProductGrid"
import { Cart } from "@/components/Cart"
import { useProducts } from "@/hooks/useProducts"
import { useCart } from "@/hooks/useCart"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export default function PermayHome() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

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
  } = useProducts()

  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItemsCount={getCartItemsCount()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64">
            <div className="sticky top-24 bg-white rounded-lg border p-4 shadow-sm">
              <FilterSidebar
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
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Controls */}
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Filtra los productos por marca, categoría y precio</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
    </div>
  )
}
