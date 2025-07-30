"use client"

import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  cartItemsCount: number
  onCartClick: () => void
}

export function Header({ searchTerm, setSearchTerm, cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 relative">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
          </div>

          <Button onClick={onCartClick} className="relative bg-permay-primary hover:bg-permay-primary/90 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10">
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
