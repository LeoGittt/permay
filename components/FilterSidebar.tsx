"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface FilterSidebarProps {
  brands: string[]
  categories: string[]
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  onClearFilters: () => void
}

export function FilterSidebar({
  brands,
  categories,
  selectedBrands,
  setSelectedBrands,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  onClearFilters,
}: FilterSidebarProps) {
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

  const totalFilters = selectedBrands.length + selectedCategories.length

  return (
    <div className="space-y-4 sm:space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b">
        <h3 className="font-semibold text-base sm:text-lg">Filtros</h3>
        {totalFilters > 0 && <Badge variant="secondary" className="text-xs">{totalFilters}</Badge>}
      </div>

      {/* Rango de Precio - Primero en móvil */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
        <h4 className="font-medium mb-3 text-sm sm:text-base">
          Precio
        </h4>
        <div className="space-y-3 sm:space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 font-medium">
            <span className="bg-white px-2 py-1 rounded border">{formatPrice(priceRange[0])}</span>
            <span className="bg-white px-2 py-1 rounded border">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Marcas */}
      <div className="bg-white border rounded-lg p-3 sm:p-4">
        <h4 className="font-medium mb-3 text-sm sm:text-base flex items-center">
          Marcas
          {selectedBrands.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">{selectedBrands.length}</Badge>
          )}
        </h4>
        <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border rounded p-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                className="flex-shrink-0"
              />
              <Label htmlFor={brand} className="text-xs sm:text-sm cursor-pointer flex-1 leading-relaxed">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white border rounded-lg p-3 sm:p-4">
        <h4 className="font-medium mb-3 text-sm sm:text-base flex items-center">
          Categorías
          {selectedCategories.length > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">{selectedCategories.length}</Badge>
          )}
        </h4>
        <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border rounded p-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                className="flex-shrink-0"
              />
              <Label htmlFor={category} className="text-xs sm:text-sm cursor-pointer flex-1 leading-relaxed">
                {category.split("/").pop()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de limpiar filtros */}
      <div className="sticky bottom-0 bg-white pt-2 border-t">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full bg-transparent text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          disabled={totalFilters === 0}
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
