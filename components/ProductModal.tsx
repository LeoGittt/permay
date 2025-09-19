"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Minus, Plus, X, MessageCircle, ChevronDown } from "lucide-react"
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Resetear la cantidad y descripción cuando se abre un nuevo producto
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setIsDescriptionExpanded(false)
    }
  }, [product])

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

  const handleWhatsAppContact = () => {
    const phoneNumber = "5492613000787"
    const message = `Hola! Me interesa el producto: ${product.name} - ${product.brand}. ¿Podrías darme más información?`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[98vh] w-[95vw] sm:w-full overflow-y-auto p-2 gap-0 rounded-md border-0 shadow-2xl"
        onInteractOutside={(e) => {
          onClose()
        }}
      >
        <div className="relative bg-white rounded-xl overflow-hidden">
          {/* Header minimalista */}
          <div className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-1 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <DialogTitle className="text-md sm:text-md font-bold text-gray-900 line-clamp-2">{product.name}</DialogTitle>
                {/* <DialogDescription className="text-sm text-gray-600 mt-1 truncate">
                  {product.brand} • {product.category.split("/").pop()}
                </DialogDescription> */}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X className="h-4 w-4 text-permay-primary" />
              </Button>
            </div>
          </div>

          <div className="p-2  sm:p-6 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Imagen del producto - ocupa más espacio */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-4">
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                    className="w-full h-80 sm:h-96 lg:h-[500px] object-contain  rounded-md shadow-md"
                  />
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-permay-primary hover:bg-permay-primary/90 text-xs sm:text-xs rounded-full px-3 py-1">
                    {product.brand}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-xs rounded-full px-3 py-1 border-gray-300">
                    {product.category.split("/").pop()}
                  </Badge>
                </div>
              </div>

              {/* Información del producto - panel lateral más compacto */}
              <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                {/* Descripción colapsable - solo mostrar si existe */}
                {product.description && product.description.trim() && (
                  <div className=" rounded-xl p-1">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="w-full flex items-center justify-between p-0 h-auto font-semibold text-permay-primary text-sm sm:text-base hover:bg-transparent"
                    >
                      Ver descripción
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isDescriptionExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </Button>
                    {isDescriptionExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200" style={{ paddingTop: '2.5rem' }}>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{product.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Precio */}
                <div className="bg-permay-primary p-3 sm:p-5 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-white mb-1">Precio</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{formatPrice(product.price)}</p>
                  </div>
                </div>

                {/* Selector de cantidad */}
                <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm sm:text-base">Cantidad:</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-8 w-8 rounded-full border-2"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="font-semibold text-base sm:text-lg w-8 text-center">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setQuantity(quantity + 1)} 
                        className="h-8 w-8 rounded-full border-2"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold border-t pt-3">
                    <span>Total:</span>
                    <span className="text-permay-primary">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Botón agregar al carrito */}
                  <Button 
                    onClick={handleAddToCart} 
                    className="w-full bg-permay-primary hover:bg-permay-primary/90 py-3 text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar al carrito
                  </Button>

                  {/* Botón WhatsApp */}
                  <Button 
                    onClick={handleWhatsAppContact} 
                    variant="outline"
                    className="w-full py-3 text-sm sm:text-base border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
