"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
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
  const [isFavorite, setIsFavorite] = useState(false)
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
        <div className="flex p-4 gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <img
              src={product.image || "/placeholder.svg?height=96&width=96"}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 bg-white shadow-sm w-6 h-6"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-3 w-3 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge variant="secondary" className="mb-1 text-xs">
                    {product.brand}
                  </Badge>
                  <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category.split("/").pop()}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-permay-primary">{formatPrice(product.price)}</span>
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">4.5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(product)} className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-permay-primary hover:bg-permay-primary/90"
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
            className="w-full h-48 object-cover rounded-t-lg"
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 shadow-sm"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          <Badge className="absolute top-2 left-2 bg-permay-primary">{product.brand}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.category.split("/").pop()}</p>
          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-bold text-permay-primary">{formatPrice(product.price)}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.5</span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(product)} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Ver más
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 bg-permay-primary hover:bg-permay-primary/90"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isLoading ? "..." : "Comprar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
