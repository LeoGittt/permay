"use client"

import { useState } from "react"
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CartItem } from "@/types/cart"
import { products } from "@/data/products"

interface CartProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
  total: number
}

export function Cart({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, total }: CartProps) {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const getProduct = (productId: number) => {
    return products.find((p) => p.id === productId)
  }

  const generateWhatsAppMessage = () => {
    let message = `🛍️ *PEDIDO PERMAY*\n\n`
    message += `👤 *Cliente:* ${customerInfo.name}\n`
    message += `📱 *Teléfono:* ${customerInfo.phone}\n`
    message += `📍 *Dirección:* ${customerInfo.address}\n\n`

    message += `🛒 *PRODUCTOS:*\n`
    cart.forEach((item) => {
      const product = getProduct(item.productId)
      if (product) {
        message += `• ${product.name}\n`
        message += `  Marca: ${product.brand}\n`
        message += `  Cantidad: ${item.quantity}\n`
        message += `  Precio: ${formatPrice(product.price * item.quantity)}\n\n`
      }
    })

    message += `💰 *TOTAL: ${formatPrice(total)}*\n\n`

    if (customerInfo.notes) {
      message += `📝 *Notas:* ${customerInfo.notes}\n\n`
    }

    message += `¡Gracias por elegir Permay!`

    return encodeURIComponent(message)
  }

  const handleSendWhatsApp = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Por favor completa tu nombre y teléfono")
      return
    }

    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/5491123456789?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const isFormValid = customerInfo.name && customerInfo.phone && cart.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0
              ? "Tu carrito está vacío"
              : `${cart.length} producto${cart.length > 1 ? "s" : ""} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {cart.map((item) => {
                  const product = getProduct(item.productId)
                  if (!product) return null

                  return (
                    <div key={item.productId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex gap-3">
                        <img
                          src={product.image || "/placeholder.svg?height=60&width=60"}
                          alt={product.name}
                          className="w-15 h-15 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-permay-primary">{formatPrice(product.price)}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 bg-transparent"
                                onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 bg-transparent"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => onRemoveItem(item.productId)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="space-y-4 py-4">
                <h3 className="font-semibold">Información de contacto</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Tu teléfono"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    placeholder="Tu dirección"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm">
                    Notas adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Comentarios sobre tu pedido..."
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Total and Checkout */}
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-permay-primary">{formatPrice(total)}</span>
                </div>

                <Button
                  onClick={handleSendWhatsApp}
                  disabled={!isFormValid}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar pedido por WhatsApp
                </Button>

                <p className="text-xs text-gray-500 text-center">Al enviar el pedido serás redirigido a WhatsApp</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
