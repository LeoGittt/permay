"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils"

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
      className="sticky top-12 sm:top-16 z-30 bg-white/95 backdrop-blur-md flex flex-col gap-1.5 mb-3 px-2 py-1.5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(196,51,212,0.07)] border border-permay-primary/10 transition-all duration-300"
    >
      {/* Top Row: Info & Clear */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-0.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-gray-100">
            <span className="text-[11px] font-black text-permay-primary uppercase tracking-tighter">Filtros</span>
            {totalFilters > 0 && (
              <span className="bg-permay-primary text-white text-[9px] h-3.5 min-w-[14px] px-1 flex items-center justify-center rounded-full font-bold">
                {totalFilters}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {activeChips.length > 0 ? (
              activeChips.map((chip) => (
                <button
                  key={chip.type + chip.value}
                  onClick={() => removeChip(chip)}
                  className="flex items-center gap-1 bg-gray-50 text-gray-600 hover:text-permay-primary hover:bg-permay-primary/5 rounded-full px-2 py-0.5 text-[10px] font-medium border border-gray-100 transition-all active:scale-95 whitespace-nowrap"
                >
                  {chip.label}
                  <X size={10} />
                </button>
              ))
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Personalizá tu búsqueda</span>
            )}
          </div>
        </div>

        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 rounded-full"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Main Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <Button 
          variant={showOffers ? "default" : "outline"}
          onClick={() => setShowOffers(!showOffers)}
          className={cn(
            "h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 border-permay-primary/10",
            showOffers 
              ? "bg-permay-primary text-white shadow-sm" 
              : "bg-white text-gray-600 hover:bg-permay-primary/5"
          )}
        >
          Ofertas ✨
        </Button>
        
        <Popover open={openBrand} onOpenChange={setOpenBrand}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 border-permay-primary/10",
                selectedBrands.length > 0 ? "bg-permay-primary/5 text-permay-primary border-permay-primary/20" : "bg-white text-gray-600"
              )}
            >
              Marcas {selectedBrands.length > 0 && `(${selectedBrands.length})`}
            </Button>
          </PopoverTrigger>
          {/* ... PopoverContent remains similar but more compact ... */}
          <PopoverContent className="w-[260px] p-0 rounded-2xl shadow-xl border-permay-primary/10" sideOffset={8} align="start">
             <div className="p-2 border-b bg-gray-50/50">
               <input
                 type="text"
                 placeholder="Buscar marca..."
                 value={brandSearch}
                 onChange={e => setBrandSearch(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-permay-primary/30 transition-all"
               />
             </div>
             <div className="p-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                {filteredBrands.map(brand => (
                  <div key={brand} onClick={() => handleBrandChange(brand, !selectedBrands.includes(brand))} className={cn("flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors", selectedBrands.includes(brand) ? "bg-permay-primary/5 text-permay-primary font-bold" : "hover:bg-gray-50 text-gray-600")}>
                    {brand}
                    <Checkbox checked={selectedBrands.includes(brand)} onCheckedChange={(c) => handleBrandChange(brand, !!c)} className="h-3.5 w-3.5" />
                  </div>
                ))}
             </div>
          </PopoverContent>
        </Popover>

        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 border-permay-primary/10",
                selectedCategories.length > 0 ? "bg-permay-primary/5 text-permay-primary border-permay-primary/20" : "bg-white text-gray-600"
              )}
            >
              Categorías {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0 rounded-2xl shadow-xl border-permay-primary/10" sideOffset={8} align="start">
             <div className="p-2 border-b bg-gray-50/50">
               <input
                 type="text"
                 placeholder="Buscar categoría..."
                 value={categorySearch}
                 onChange={e => setCategorySearch(e.target.value)}
                 className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-permay-primary/30 transition-all"
               />
             </div>
             <div className="p-1 max-h-[240px] overflow-y-auto custom-scrollbar">
                {filteredCategories.map(cat => {
                   const label = capitalize(toSingular(cat.split("/").pop() ?? cat));
                   return (
                    <div key={cat} onClick={() => handleCategoryChange(cat, !selectedCategories.includes(cat))} className={cn("flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors", selectedCategories.includes(cat) ? "bg-permay-primary/5 text-permay-primary font-bold" : "hover:bg-gray-50 text-gray-600")}>
                      {label}
                      <Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={(c) => handleCategoryChange(cat, !!c)} className="h-3.5 w-3.5" />
                    </div>
                  );
                })}
             </div>
          </PopoverContent>
        </Popover>

        {/* Precio - Más integrado y compacto */}
        <Popover open={openPrice} onOpenChange={setOpenPrice}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "h-8 px-3 rounded-xl text-[11px] font-bold transition-all shrink-0 border-permay-primary/10",
                (priceRange[0] !== 0 || priceRange[1] !== 500000) ? "bg-permay-primary/5 text-permay-primary border-permay-primary/20" : "bg-white text-gray-600"
              )}
            >
              Precio
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4 rounded-2xl shadow-xl border-permay-primary/10" sideOffset={8} align="start">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Rango</span>
                  <span className="text-xs font-black text-permay-primary">
                    ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                  </span>
                </div>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500000}
                min={0}
                step={5000}
                className="w-full py-2"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                 <Button size="sm" onClick={() => setOpenPrice(false)} className="h-7 text-[10px] bg-permay-primary rounded-lg font-bold">Aplicar</Button>
                 <Button size="sm" variant="ghost" onClick={() => setPriceRange([0, 500000])} className="h-7 text-[10px] text-gray-400 hover:text-red-500 rounded-lg">Reset</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
