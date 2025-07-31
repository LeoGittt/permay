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
        <div className="flex flex-row w-full gap-3 items-center sm:justify-between sm:gap-6">
  {/* Menú hamburguesa a la izquierda */}
  <Sheet open={openMenu} onOpenChange={setOpenMenu}>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-800 hover:bg-gray-100 transition-all rounded-full hover:scale-105"
        onClick={() => setOpenMenu(true)}
      >
        <Menu className="w-6 h-6" />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="left"
      className="w-72 sm:w-80 flex flex-col p-6 bg-white border-r-2 border-gray-100 shadow-xl"
    >
      <SheetHeader className="pb-6 border-b border-gray-200">
        <div className="flex flex-col items-center gap-2">
          {/* Logo más grande */}
          <div className="w-20 h-20 relative drop-shadow-md rounded-full bg-white overflow-hidden border-2 border-permay-primary">
            <Image
              src="/logo.jpeg"
              alt="Logo Permay"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-center">
            
            <span className="text-sm text-gray-500">Perfumería & Belleza</span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-2 my-4">
        {/* Botones con colores y efectos */}
        <a
          href="/"
          className="group flex items-center gap-4 text-base font-semibold text-permay-primary px-4 py-3 rounded-lg transition-all hover:bg-permay-primary/10 focus:outline-none focus:ring-2 focus:ring-permay-primary/50"
        >
          <Home className="w-5 h-5 text-permay-primary group-hover:scale-110 transition-transform" /> Inicio
        </a>
        <a
          href="https://maps.app.goo.gl/3N1SEfpKyNjQaFq38"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 text-base font-semibold text-gray-700 px-4 py-3 rounded-lg transition-all hover:bg-permay-primary/5 hover:text-permay-primary focus:outline-none focus:ring-2 focus:ring-permay-primary/50"
        >
          <MapPin className="w-5 h-5 text-gray-500 group-hover:scale-110 transition-transform" /> Ubicación
        </a>
        <a
          href="https://www.instagram.com/permayperfumeria/?hl=es"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 text-base font-semibold text-gray-700 px-4 py-3 rounded-lg transition-all hover:bg-permay-primary/5 hover:text-permay-primary focus:outline-none focus:ring-2 focus:ring-permay-primary/50"
        >
          <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" /> Instagram
        </a>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200">
        <span className="block text-sm font-semibold mb-3 text-gray-700">
          ¿Dónde estamos?
        </span>
        <a
          href="https://maps.app.goo.gl/3N1SEfpKyNjQaFq38"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-permay-primary"
          aria-label="Abrir ubicación en Google Maps"
        >
          <iframe
            src="https://www.google.com/maps?q=-38.9516,-68.0591&z=17&output=embed"
            width="100%"
            height="180"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Permay"
          ></iframe>
        </a>
      </div>

      <a
        href="https://wa.me/5492613000787"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-3 text-base font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
      >
        <MessageCircle className="w-5 h-5 text-white animate-pulse" />
        <span className="tracking-wide">WhatsApp</span>
      </a>
    </SheetContent>
  </Sheet>

  {/* Buscador y carrito */}
  <div className="flex flex-1 w-full sm:w-auto">
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-11 text-sm h-10 w-full rounded-full border-gray-300 bg-gray-50 focus:border-permay-primary focus:ring-permay-primary transition-all"
      />
    </div>
  </div>

  <Button
    onClick={onCartClick}
    className="relative bg-permay-primary hover:bg-permay-primary/90 text-sm px-4 h-10 rounded-full ml-2 transition-all shadow-md hover:shadow-lg"
  >
    <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />
    <span className="hidden sm:inline ml-2">Carrito</span>
    {cartItemsCount > 0 && (
      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 border-2 border-white animate-pop">
        {cartItemsCount > 99 ? '99+' : cartItemsCount}
      </Badge>
    )}
  </Button>
</div>
      </div>
    </header>
  )
}
