"use client"

import { useState } from "react"
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
        <div className="relative">
          <img
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            className="w-full h-36 sm:h-48 object-cover rounded-t-lg"
          />

          <Badge className="absolute top-2 left-2 bg-permay-primary text-xs">
            {product.brand}
          </Badge>
        </div>
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
