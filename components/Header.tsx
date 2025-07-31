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
        {/* Logo arriba, centrado y mejorado visualmente */}
        <div className="flex justify-center items-center mb-2">
          <a href="/" aria-label="Ir a la página principal">
            <div className="w-28 h-28 sm:w-32 sm:h-32 relative transition-transform hover:scale-105 mx-auto shadow-lg border-4 border-white rounded-full bg-white">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
          </a>
        </div>
        {/* Buscador y carrito juntos en una fila en mobile, separados en desktop */}
        <div className="flex flex-row w-full gap-2 items-center sm:justify-between sm:gap-4">
          <div className="flex flex-1 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-base h-10"
              />
            </div>
          </div>
          <Button onClick={onCartClick} className="relative bg-permay-primary hover:bg-permay-primary/90 text-sm px-4 h-10 w-16 sm:w-auto ml-2">
            <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline ml-2">Carrito</span>
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
