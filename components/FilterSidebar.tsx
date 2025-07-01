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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtros</h3>
        {totalFilters > 0 && <Badge variant="secondary">{totalFilters}</Badge>}
      </div>

      <div>
        <h4 className="font-medium mb-3">Marcas</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
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
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Categorías</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="text-sm cursor-pointer">
                {category.split("/").pop()}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Precio</h4>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onClearFilters}
        className="w-full bg-transparent"
        disabled={totalFilters === 0}
      >
        Limpiar filtros
      </Button>
    </div>
  )
}
