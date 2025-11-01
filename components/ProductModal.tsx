"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Minus, Plus, X, MessageCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
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
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  // Resetear la cantidad y descripción cuando se abre un nuevo producto
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setIsDescriptionExpanded(false)
      setIsImageLoaded(false)
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
        className="max-w-6xl max-h-[95vh] w-[95vw] sm:w-full overflow-hidden p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50"
        onInteractOutside={(e) => {
          onClose()
        }}
      >
        <div className="relative bg-gradient-to-br from-white via-white to-gray-50/30 rounded-2xl overflow-hidden">
          {/* Header mejorado con gradiente */}
          <div className="sticky top-0 z-20 bg-gradient-to-r from-white via-white to-gray-50/80 backdrop-blur-sm border-b border-gray-200/60 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <DialogTitle className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                  {product.name}
                </DialogTitle>
                <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-md hover:bg-permay-primary/10 hover:border-permay-primary/30 border border-transparent transition-all duration-200"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-permay-primary" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Imagen del producto - más grande */}
              <div className="lg:col-span-3 space-y-2">
                <div className="relative group">
                  <div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg cursor-pointer"
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <img
                      src={product.image || "/placeholder.svg?height=400&width=400"}
                      alt={product.name}
                      className={cn(
                        "w-full h-72 sm:h-96 lg:h-[550px] object-contain transition-all duration-700 transform hover:scale-105",
                        !isImageLoaded && "opacity-0 scale-95"
                      )}
                      onLoad={() => setIsImageLoaded(true)}
                    />
                    {!isImageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl" />
                    )}
                    {/* Overlay sutil en hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    {/* Indicador de que se puede hacer click */}
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Modal de imagen expandida */}
                {isImageExpanded && (
                  <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsImageExpanded(false)}
                  >
                    <div className="relative max-w-4xl max-h-full">
                      <img
                        src={product.image || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsImageExpanded(false)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Badges más pequeños */}
                <div className="flex gap-1 flex-wrap">
                  <Badge className="bg-permay-primary hover:bg-permay-primary/90 text-white px-2 py-0.5 text-xs font-medium rounded shadow-sm hover:shadow transition-all duration-200">
                    {product.brand}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal rounded border border-gray-300 hover:border-permay-primary hover:bg-permay-primary hover:text-white transition-all duration-200">
                    {product.category.split("/").pop()}
                  </Badge>
                </div>
              </div>

              {/* Panel lateral mejorado */}
              <div className="lg:col-span-2 space-y-4">
                {/* Descripción elegante mejorada */}
                {product.description && product.description.trim() && (
                  <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300/60 transition-all duration-300">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="w-full flex items-center justify-between p-3 font-medium text-gray-800 hover:bg-gray-50/80 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-permay-primary to-permay-primary/60 rounded-full"></div>
                        <span className="text-sm font-semibold">Descripción</span>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-all duration-300 text-gray-500 group-hover:text-permay-primary ${
                          isDescriptionExpanded ? 'rotate-180 text-permay-primary' : ''
                        }`} 
                      />
                    </Button>
                    <div className={cn(
                      "transition-all duration-300 overflow-hidden",
                      isDescriptionExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="px-3 pb-3 border-t border-gray-100/60">
                        <div className="bg-white/60 rounded-lg p-3 mt-2">
                          <p className="text-gray-700 leading-relaxed text-sm font-normal">{product.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Precio mejorado */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors duration-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Precio</p>
                    <p className="text-2xl font-bold text-permay-primary">{formatPrice(product.price)}</p>
                  </div>
                </div>

                {/* Selector de cantidad minimalista */}
                <div className="bg-white rounded-lg border border-gray-200 p-2 hover:border-gray-300 transition-colors duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Cantidad</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-6 w-6 rounded border hover:border-permay-primary hover:bg-permay-primary hover:text-white transition-colors duration-200 disabled:opacity-50"
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <div className="bg-gray-100 rounded px-2 py-0.5 min-w-[40px] text-center">
                          <span className="font-semibold text-sm text-gray-800">{quantity}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setQuantity(quantity + 1)} 
                          className="h-6 w-6 rounded border hover:border-permay-primary hover:bg-permay-primary hover:text-white transition-colors duration-200"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Total minimalista */}
                    <div className="bg-gray-50 rounded px-2 py-1.5 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Total</span>
                        <span className="font-bold text-sm text-permay-primary">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción mejorados */}
                <div className="space-y-2">
                  {/* Botón agregar al carrito principal */}
                  <Button 
                    onClick={handleAddToCart} 
                    className="w-full bg-permay-primary hover:bg-permay-primary/90 text-white py-3 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar al carrito
                  </Button>

                  {/* Botón WhatsApp mejorado */}
                  <Button 
                    onClick={handleWhatsAppContact} 
                    variant="outline"
                    className="w-full py-3 text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500 rounded-lg transition-all duration-200 active:scale-[0.98]"
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
