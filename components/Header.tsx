"use client"

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, MapPin, Instagram, Home, MessageCircle, Phone, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ searchTerm, setSearchTerm, cartItemsCount, onCartClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const pathname = usePathname();

  // Efecto para el cambio de estilo al scrollear
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú hamburguesa al presionar atrás en mobile
  useEffect(() => {
    if (!openMenu) return;
    const handlePopState = () => setOpenMenu(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openMenu]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 w-full",
        isScrolled 
          ? "bg-white/95 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-permay-primary/5" 
          : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between relative py-3 sm:py-5 min-h-[70px] sm:min-h-[90px]">
          
          {/* BLOQUE IZQUIERDO: Navegación y Buscador Expandible */}
          <div className={cn(
            "flex items-center gap-2 transition-all duration-500 z-50",
            isSearchActive ? "w-full" : "min-w-[80px]"
          )}>
            {!isSearchActive && (
              <Sheet open={openMenu} onOpenChange={setOpenMenu}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-permay-primary/5 text-gray-800"
                  >
                    <Menu className="w-5 h-5 sm:w-7 sm:h-7" />
                  </Button>
                </SheetTrigger>
                {/* Menú móvil más chico */}
                <SheetContent side="left" className="w-72 sm:max-w-xs p-0 flex flex-col bg-white border-r-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 bg-gradient-to-br from-permay-primary/5 via-white to-white border-b text-center">
                      <SheetTitle className="sr-only">Explorar Permay</SheetTitle>
                      <div className="flex flex-col items-center justify-center gap-2">
                        {/* Logo más chico */}
                        <div className="w-20 h-20 relative">
                          <Image src="/logonuevo.png" alt="Permay" fill className="object-contain" />
                        </div>
                      </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                      <SidebarLink href="/" icon={Home} label="Inicio" active={pathname === "/"} />
                      <SidebarLink href="/landing-page" icon={Phone} label="Nosotros" active={pathname === "/landing-page"} />
                      <SidebarLink href="https://maps.app.goo.gl/JPma6Ryj9YS3iR198" icon={MapPin} label="Nuestra Tienda" external />
                      <SidebarLink href="https://www.instagram.com/permayperfumeria/?hl=es" icon={Instagram} label="Síguenos en Instagram" external color="text-pink-500" />
                    </div>
                    <div className="border-t p-3 bg-gray-50">
                      <h3 className="font-bold text-gray-900 mb-2 text-xs">Nuestra Ubicación</h3>
                      {/* Mapa más chico */}
                      <iframe 
                        src="https://maps.google.com/maps?q=San+Juan+1248+Mendoza+Argentina&z=15&output=embed"
                        width="100%"
                        height="120"
                        style={{ border: 0, borderRadius: "8px" }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                      <div className="flex justify-center mt-2">
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                            <X className="w-5 h-5 text-gray-400" />
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <div className={cn(
              "relative flex items-center transition-all duration-500 ease-in-out overflow-hidden rounded-full",
              isSearchActive 
                ? "w-full shadow-lg ring-2 ring-permay-primary/20 bg-white h-12 sm:h-14" 
                : "w-10 h-10 sm:w-12 sm:h-12 bg-transparent"
            )}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchActive(!isSearchActive)}
                className={cn(
                  "shrink-0 rounded-full transition-colors z-10",
                  isSearchActive ? "text-permay-primary ml-3 hover:bg-transparent" : "w-10 h-10 sm:w-12 sm:h-12 text-gray-800 hover:bg-permay-primary/5"
                )}
              >
                <Search className="w-5 h-5 sm:w-7 sm:h-7" />
              </Button>
              
              <Input
                autoFocus={isSearchActive}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "border-none bg-transparent focus-visible:ring-0 text-lg sm:text-xl transition-all duration-300",
                  isSearchActive ? "w-full pl-3 pr-12 opacity-100" : "w-0 p-0 opacity-0"
                )}
              />
              
              {isSearchActive && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchTerm("");
                  }}
                  className="absolute right-2 w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* CENTRO: Logo Flotante - Se oculta al buscar */}
          <div className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] transition-all duration-500",
            isSearchActive ? "opacity-0 scale-50 invisible" : "opacity-100 scale-100 visible"
          )}>
            <a href="/" className="group block focus:outline-none">
              <div className={cn(
                "relative transition-all duration-700 ease-in-out transform flex items-center justify-center",
                isScrolled 
                  ? "w-16 h-16 sm:w-20 sm:h-20" 
                  : "w-32 h-32 sm:w-56 sm:h-56"
              )}>
                <Image
                  src="/logonuevo.png"
                  alt="Permay Logo"
                  fill
                  className="object-contain drop-shadow-[0_5px_15px_rgba(196,51,212,0.2)] transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </a>
          </div>

          {/* BLOQUE DERECHO: Carrito - Se oculta al buscar en móvil para dar espacio */}
          <div className={cn(
            "flex items-center justify-end flex-1 transition-all duration-500",
            isSearchActive ? "opacity-0 scale-90 invisible w-0" : "opacity-100 scale-100 visible min-w-[80px]"
          )}>
            <Button
              onClick={onCartClick}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-full transition-all duration-500 h-10 sm:h-14 px-3 sm:px-8",
                "bg-gradient-to-br from-permay-primary via-[#D84AE8] to-permay-primary bg-[length:200%_auto] hover:bg-right text-white shadow-xl shadow-permay-primary/20 hover:shadow-permay-primary/30"
              )}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline text-base font-black tracking-tight uppercase">Carrito</span>
              {cartItemsCount > 0 && (
                <span className="flex items-center justify-center absolute -top-1 -right-1 sm:-top-1 sm:-right-2 min-w-[24px] h-[24px] px-1 bg-white text-permay-primary text-[11px] font-black rounded-full border-2 border-permay-primary shadow-lg animate-pop">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
}

function SidebarLink({ href, icon: Icon, label, active = false, external = false, color = "text-gray-600" }: any) {
  const content = (
    <>
      <div className={cn(
        "p-2 rounded-lg transition-colors group-hover:bg-permay-primary/10",
        active ? "bg-permay-primary/10 text-permay-primary" : "bg-gray-50 text-gray-400"
      )}>
        <Icon className={cn("w-5 h-5", active ? "text-permay-primary" : color)} />
      </div>
      <span className={cn(
        "font-semibold transition-colors",
        active ? "text-permay-primary" : "text-gray-700 group-hover:text-permay-primary"
      )}>{label}</span>
    </>
  );

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 p-2 rounded-xl border border-transparent hover:border-permay-primary/10 hover:bg-permay-primary/5 transition-all active:scale-[0.98]"
    >
      {content}
    </a>
  );
}
