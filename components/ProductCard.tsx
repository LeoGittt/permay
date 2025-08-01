"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative flex items-center justify-center border-b rounded-t-lg w-full h-36 sm:h-48 overflow-hidden cursor-zoom-in group" onClick={() => setShowImageModal(true)}>
          {/* Fondo desenfocado */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)',
              filter: 'blur(16px) saturate(1.2)',
              opacity: 0.85,
            }}
          />
          <img
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            className="object-contain w-full h-full max-h-36 sm:max-h-48 z-10 transition-all duration-200 group-hover:scale-105"
            style={{ position: 'relative' }}
          />
          <Badge className="absolute top-2 left-2 bg-permay-primary text-xs z-20">
            {product.brand}
          </Badge>
        </div>

        {/* Modal de imagen */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-full max-h-full p-2" onClick={e => e.stopPropagation()}>
              <img
                src={product.image || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                className="object-contain rounded-lg shadow-2xl max-h-[90vh] max-w-[90vw] bg-white"
                style={{ background: 'white' }}
              />
              <button
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow text-3xl leading-none flex items-center justify-center"
                onClick={() => setShowImageModal(false)}
                aria-label="Cerrar imagen"
                style={{ width: 44, height: 44 }}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-3 sm:p-4">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{product.name}</h3>
          <p className="text-xs text-gray-500 capitalize truncate">{product.category.split("/").pop()}</p>
          {product.description && product.description.trim() && (
            <p className="text-xs text-gray-600 line-clamp-2 hidden sm:block">{product.description}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col gap-2 sm:gap-3">
        <div className="w-full text-center">
          <span className="text-base sm:text-lg font-bold text-permay-primary">{formatPrice(product.price)}</span>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(product)} className="flex-1 text-xs sm:text-sm">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Ver más</span>
            <span className="sm:hidden">Ver</span>
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 bg-permay-primary hover:bg-permay-primary/90 text-xs sm:text-sm"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {isLoading ? "..." : "Comprar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
