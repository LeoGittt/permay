"use client"

import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  cartItemsCount: number
  onCartClick: () => void
}

export function Header({ searchTerm, setSearchTerm, cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-permay-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-permay-primary">Permay</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Tienda de belleza</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={onCartClick} className="relative bg-permay-primary hover:bg-permay-primary/90">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
