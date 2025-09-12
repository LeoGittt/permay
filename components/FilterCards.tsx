"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { X, Search } from "lucide-react"

interface FilterCardsProps {
  brands: string[]
  categories: string[]
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  showOffers: boolean
  setShowOffers: (value: boolean) => void
  onClearFilters: () => void
}

export function FilterCards({
  brands,
  categories,
  selectedBrands,
  setSelectedBrands,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  showOffers,
  setShowOffers,
  onClearFilters,
}: FilterCardsProps) {
  const [openBrand, setOpenBrand] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)
  const [openPrice, setOpenPrice] = useState(false)
  const [openAllCategories, setOpenAllCategories] = useState(false)
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  // Capitalizar y singularizar
  function toSingular(word: string) {
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }
  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Ordenar y filtrar marcas/categorías
  const filteredBrands = brands
    .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
  const filteredCategories = categories
    .filter((c) => {
      const base = c.split("/").pop() ?? c;
      return base.toLowerCase().includes(categorySearch.toLowerCase());
    })
    .sort((a, b) => {
      const aBase = a.split("/").pop() ?? a;
      const bBase = b.split("/").pop() ?? b;
      return aBase.localeCompare(bBase);
    });

  const totalFilters = selectedBrands.length + selectedCategories.length + (showOffers ? 1 : 0)

  // Chips removibles para filtros activos
  const activeChips = [
    ...(showOffers ? [{ label: "Ofertas", type: "offers" as const, value: "offers" }] : []),
    ...selectedBrands.map((brand) => ({
      label: brand,
      type: "brand" as const,
      value: brand,
    })),
    ...selectedCategories.map((cat) => ({
      label: cat.split("/").pop() ?? cat,
      type: "category" as const,
      value: cat,
    })),
  ]

  const removeChip = (chip: { type: "brand" | "category" | "offers"; value: string }) => {
    if (chip.type === "brand") {
      setSelectedBrands(selectedBrands.filter((b) => b !== chip.value))
    } else if (chip.type === "category") {
      setSelectedCategories(selectedCategories.filter((c) => c !== chip.value))
    } else if (chip.type === "offers") {
      setShowOffers(false)
    }
  }

  return (
    <div
      className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur flex flex-col gap-2 mb-6 px-1 sm:px-2 py-2 sm:py-3 rounded-lg shadow-sm border"
      style={{
        // sticky solo en desktop
        position: 'sticky',
      }}
    >
      {/* Badge general de filtros activos */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-base">Filtros</span>
        {totalFilters > 0 && (
          <Badge variant="default" className="bg-blue-600 text-white animate-pulse">{totalFilters} activos</Badge>
        )}
      </div>

      {/* Chips de filtros activos */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {activeChips.map((chip) => (
            <span
              key={chip.type + chip.value}
              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium shadow-sm border border-blue-200 active:scale-95 transition-transform"
            >
              {chip.label}
              <button
                className="ml-1 hover:text-red-500 focus:outline-none"
                onClick={() => removeChip(chip)}
                aria-label={`Quitar filtro ${chip.label}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Cards de filtros principales */}
      {(brands.length > 0 || categories.length > 0) ? (
        <div className="flex flex-wrap gap-3 pb-1">
          {/* Filtro de Ofertas */}
          <Button 
            variant={showOffers ? "default" : "outline"}
            onClick={() => setShowOffers(!showOffers)}
            className={`flex items-center gap-2 min-w-[110px] sm:min-w-[120px] h-10 sm:h-10 px-3 sm:px-4 text-sm sm:text-base font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105 ${
              showOffers 
                ? "bg-permay-primary hover:bg-permay-primary/90 border-permay-primary text-white" 
                : "bg-white hover:bg-permay-primary/10 border-permay-primary text-permay-primary"
            }`}
          >
            Ofertas
          </Button>
          
          {/* Marcas */}
          <Popover open={openBrand} onOpenChange={setOpenBrand}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[110px] sm:min-w-[120px] h-10 sm:h-10 px-3 sm:px-4 text-sm sm:text-base bg-permay-primary hover:bg-permay-primary/80 border-permay-primary text-white font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105"
              >
                Marcas
                {selectedBrands.length > 0 && <Badge variant="secondary" className="bg-white text-permay-primary">{selectedBrands.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[95vw] max-w-xs sm:w-64 sm:max-w-xs max-h-[70vh] animate-fade-in p-4"
              sideOffset={8}
              align="start"
            >
              <div className="mb-2 mt-2 flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar marca..."
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1"
                  tabIndex={-1} // <-- evita foco automático
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredBrands.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-2">No hay resultados</div>
                ) : filteredBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                    />
                    <Label htmlFor={brand} className="text-sm cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedBrands.length > 0 && (
                <div className="pt-3 border-t mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBrands([])}
                    className="w-full text-xs bg-permay-primary hover:bg-permay-primary border-permay-primary text-white"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Categorías */}
          <Popover open={openCategory} onOpenChange={setOpenCategory}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[110px] sm:min-w-[120px] h-10 sm:h-10 px-3 sm:px-4 text-sm sm:text-base bg-permay-primary hover:bg-permay-primary/80 border-permay-primary text-white font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105"
              >
                Categorías
                {selectedCategories.length > 0 && <Badge variant="secondary" className="bg-white text-permay-primary">{selectedCategories.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[95vw] max-w-xs sm:w-64 sm:max-w-xs max-h-[70vh] animate-fade-in p-4"
              sideOffset={8}
              align="start"
            >
              <div className="mb-2 mt-2 flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1"
                  tabIndex={-1} // <-- evita foco automático
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-2">No hay resultados</div>
                ) : filteredCategories.map((category) => {
                  const base = category.split("/").pop() ?? category;
                  return (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={category} className="text-sm cursor-pointer">
                        {capitalize(toSingular(base))}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <div className="pt-3 border-t mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategories([])}
                    className="w-full text-xs bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Precio */}
          <Popover open={openPrice} onOpenChange={setOpenPrice}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[120px] h-10 px-3 sm:px-4 text-sm sm:text-base bg-permay-primary hover:bg-permay-primary/80 border-permay-primary text-white font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105"
              >
                Precio
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 animate-fade-in p-4">
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                {(priceRange[0] !== 0 || priceRange[1] !== 500000) && (
                  <div className="pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange([0, 500000])}
                      className="w-full text-xs bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Limpiar filtros */}
          <div className="flex items-center">
            <div className="relative group">
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="min-w-[120px]"
                disabled={totalFilters === 0}
              >
                Limpiar filtros
              </Button>
              {totalFilters === 0 && (
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  No hay filtros para limpiar
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">No hay filtros disponibles</div>
      )}
    </div>
  )
}
