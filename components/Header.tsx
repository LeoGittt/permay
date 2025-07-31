"use client"

import { useState, useEffect } from "react";
import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, MapPin, Instagram, Home, MessageCircle } from "lucide-react";
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
  const [openMenu, setOpenMenu] = useState(false);
  // Cerrar menú hamburguesa al presionar atrás en mobile
  useEffect(() => {
    if (!openMenu) return;
    const handlePopState = () => setOpenMenu(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openMenu]);

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
        {/* Menú hamburguesa, buscador y carrito */}
        <div className="flex flex-row w-full gap-2 items-center sm:justify-between sm:gap-4">
          {/* Menú hamburguesa a la izquierda */}
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setOpenMenu(true)}>
                <Menu className="w-7 h-7 text-permay-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80 flex flex-col gap-6 pt-8 bg-gradient-to-b from-white via-gray-50 to-permay-primary/10">
              <SheetHeader>
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 relative mb-2 drop-shadow-lg border-4 border-permay-primary rounded-full bg-white animate-pulse-slow">
                    <Image src="/logo.jpeg" alt="Logo" fill className="object-contain rounded-full" />
                  </div>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <a href="/" className="flex items-center gap-3 text-base font-semibold hover:text-permay-primary transition-colors px-3 py-2 rounded-lg hover:bg-permay-primary/10">
                  <Home className="w-5 h-5" /> Inicio
                </a>
                <a href="https://maps.app.goo.gl/3N1SEfpKyNjQaFq38" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-base font-semibold hover:text-permay-primary transition-colors px-3 py-2 rounded-lg hover:bg-permay-primary/10">
                  <MapPin className="w-5 h-5" /> Ubicación
                </a>
                <a href="https://www.instagram.com/permayperfumeria/?hl=es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-base font-semibold hover:text-permay-primary transition-colors px-3 py-2 rounded-lg hover:bg-permay-primary/10">
                  <Instagram className="w-5 h-5" /> Instagram
                </a>
              </div>
              <div className="my-2 border-t border-gray-200" />
              <div className="my-2 border-t border-gray-200" />
              <div className="mt-2">
                <span className="block text-sm font-semibold mb-2 text-permay-primary">¿Dónde estamos?</span>
                <a
                  href="https://maps.app.goo.gl/3N1SEfpKyNjQaFq38"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border shadow focus:outline-none focus:ring-2 focus:ring-permay-primary"
                  aria-label="Abrir ubicación en Google Maps"
                >
                  <iframe
                    src="https://www.google.com/maps?q=-38.9516,-68.0591&z=17&output=embed"
                    width="100%"
                    height="180"
                    style={{ border: 0, pointerEvents: 'none' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación Permay"
                  ></iframe>
                </a>
              </div>
              <div className="flex-1" />
              <a
                href="https://wa.me/5492991234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-green-500 via-green-400 to-green-500 hover:from-green-600 hover:to-green-600 text-white px-5 py-3 rounded-full shadow-lg transition-all justify-center border-2 border-green-600 animate-bounce-slow mb-2 mt-4"
                style={{ boxShadow: '0 4px 16px 0 #22c55e44' }}
              >
                <span className="bg-white rounded-full p-1 mr-2 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-green-600" /></span>
                <span className="tracking-wide">Contactar por WhatsApp</span>
              </a>
            </SheetContent>
          </Sheet>
          {/* Buscador y carrito */}
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
