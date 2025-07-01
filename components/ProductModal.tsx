"use client"

import { useState } from "react"
import { ShoppingCart, Star, Heart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Product } from "@/types/product"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (productId: number, quantity: number) => void
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <DialogDescription>
            {product.brand} - {product.category.split("/").pop()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            <div className="flex gap-2">
              <Badge>{product.brand}</Badge>
              <Badge variant="outline">{product.category.split("/").pop()}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Descripción</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Precio unitario:</span>
                <span className="font-bold text-xl text-permay-primary">{formatPrice(product.price)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Calificación:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm ml-1">(4.5)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cantidad:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-permay-primary">{formatPrice(product.price * quantity)}</span>
              </div>
            </div>

            <Button onClick={handleAddToCart} className="w-full bg-permay-primary hover:bg-permay-primary/90 py-6">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Agregar al carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
