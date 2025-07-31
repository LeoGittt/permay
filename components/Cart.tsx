"use client"

import { useState } from "react"
import { useEffect } from "react"
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

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ cartOpen: true }, "");
      const handlePopState = (e: PopStateEvent) => {
        if (isOpen) {
          onClose();
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        // Si el carrito se cierra por otro medio, retroceder el historial para no dejar un estado "extra"
        if (window.history.state && window.history.state.cartOpen) {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")

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
    message += `📱 *Teléfono:* ${customerInfo.phone}\n\n`

    message += `💳 *Forma de pago:* ${paymentMethod}\n`
    message += `🏬 *Retiro:* Presencial (única opción)\n\n`

    message += ` *PRODUCTOS:*\n`
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
                    <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex gap-2 items-center">
                        <img
                          src={product.image || "/placeholder.svg?height=40&width=40"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs line-clamp-2">{product.name}</h4>
                          <p className="text-[10px] text-gray-500">{product.brand}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-permay-primary text-sm">{formatPrice(product.price)}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 bg-transparent"
                                onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium w-5 text-center text-xs">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5 bg-transparent"
                                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-red-500 hover:text-red-700"
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
              </div>

              <Separator />

              {/* Pago y Total */}
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-semibold mb-1">Forma de pago</h4>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Efectivo"
                        checked={paymentMethod === "Efectivo"}
                        onChange={() => setPaymentMethod("Efectivo")}
                        className="accent-green-600"
                      />
                      Efectivo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Transferencia"
                        checked={paymentMethod === "Transferencia"}
                        onChange={() => setPaymentMethod("Transferencia")}
                        className="accent-green-600"
                      />
                      Transferencia bancaria
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Tarjeta de crédito"
                        checked={paymentMethod === "Tarjeta de crédito"}
                        onChange={() => setPaymentMethod("Tarjeta de crédito (hasta 3 cuotas sin interés)")}
                        className="accent-green-600"
                      />
                      Tarjeta de crédito <span className="text-xs text-gray-500">(hasta 3 cuotas sin interés)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Retiro / Envío</h4>
                  {paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" ? (
                    <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700">
                      <span className="font-semibold text-red-600">Con tarjeta de crédito solo retiro presencial.</span><br/>
                      Dirección: San Juan 1248, M5500 Mendoza
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700">
                        <span className="font-semibold">Opción 1:</span> Retiro presencial<br/>
                        Dirección: San Juan 1248, M5500 Mendoza
                      </div>
                      <div className="bg-green-100 rounded px-3 py-2 text-sm text-green-700 border border-green-300">
                        <span className="font-semibold">Opción 2:</span> Envío con cadetería local<br/>
                        <span className="text-xs">Coordinaremos el envío por WhatsApp tras tu pedido.</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-permay-primary">{formatPrice(total)}</span>
                </div>

                {paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" && (
                  <div className="mb-2 text-xs text-red-600 text-center font-semibold">
                    Con tarjeta de crédito solo podrás retirar presencialmente en San Juan 1248, M5500 Mendoza.
                  </div>
                )}
                <Button
                  onClick={handleSendWhatsApp}
                  disabled={!(customerInfo.name && customerInfo.phone && cart.length > 0)}
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
