"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: number, quantity?: number) => void
  onViewDetails: (product: Product) => void
  viewMode: "grid" | "list"
}

export function ProductCard({ product, onAddToCart, onViewDetails, viewMode }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const [showImageModal, setShowImageModal] = useState(false);

  // Cerrar modal de imagen al presionar atrás en móvil
  useEffect(() => {
    if (!showImageModal) return;
    window.history.pushState({ imageModal: true }, "");
    const handlePopState = (e: PopStateEvent) => {
      if (showImageModal) setShowImageModal(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state && window.history.state.imageModal) {
        window.history.back();
      }
    };
  }, [showImageModal]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onAddToCart(product.id)
    setIsLoading(false)
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex p-3 sm:p-4 gap-3 sm:gap-4">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
            <img
              src={product.image || "/placeholder.svg?height=96&width=96"}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="mb-1 text-xs">
                    {product.brand}
                  </Badge>
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 capitalize truncate">{product.category.split("/").pop()}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold text-permay-primary">{formatPrice(product.price)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(product)} className="flex-1 text-xs sm:text-sm">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-permay-primary hover:bg-permay-primary/90 text-xs sm:text-sm"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {isLoading ? "..." : "Comprar"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      onClick={() => onViewDetails(product)}
      className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden border-permay-primary/5 rounded-lg sm:rounded-2xl bg-white cursor-pointer group"
    >
      <CardHeader className="p-0">
        <div className="relative flex items-center justify-center border-b border-permay-primary/5 w-full h-24 sm:h-48 overflow-hidden">
          {/* Fondo decorativo minimalista */}
          <div className="absolute inset-0 z-0 bg-gray-50/50" />
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-contain w-full h-full p-1.5 sm:p-4 z-10 transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-1 left-1 z-20">
            <span className="bg-white/90 backdrop-blur-sm text-permay-primary text-[7px] sm:text-xs font-bold px-1 py-0.5 rounded border border-permay-primary/5 shadow-sm uppercase tracking-tighter">
              {product.brand}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-1 sm:p-4 pb-0 sm:pb-2">
        <div className="space-y-0.5 sm:space-y-2">
          <h3 className="font-bold text-[10px] sm:text-base leading-[1.1] line-clamp-2 min-h-[22px] sm:min-h-[3rem] text-gray-900 group-hover:text-permay-primary transition-colors">{product.name}</h3>
          <p className="text-[8px] sm:text-xs text-permay-primary/60 font-medium uppercase tracking-tighter truncate">
            {product.category.split("/").pop()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-1 sm:p-4 pt-1 flex flex-col gap-1 sm:gap-3 items-center">
        <div className="w-full text-center sm:text-left mb-0.5 sm:mb-0">
          <span className="text-sm sm:text-lg font-black text-permay-primary leading-none">{formatPrice(product.price)}</span>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={isLoading}
          className={cn(
            "w-[90%] sm:w-full h-6 sm:h-10 text-[9px] sm:text-sm rounded-full font-bold shadow-md shadow-permay-primary/10 transition-all active:scale-95",
            "bg-gradient-to-br from-permay-primary via-[#D84AE8] to-permay-primary bg-[length:200%_auto] hover:bg-right text-white p-0 px-2 sm:px-4"
          )}
        >
          <ShoppingCart className="h-2.5 w-2.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="leading-none">{isLoading ? "..." : "Comprar"}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
