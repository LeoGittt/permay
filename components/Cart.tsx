"use client"

import { useState } from "react"
import { useEffect } from "react"
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, ChevronDown, CreditCard, Truck, MapPin, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import dynamic from "next/dynamic"
import type { CartItem } from "@/types/cart"
import { products } from "@/data/products"
import { productService } from "@/lib/supabase-services"

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(
  () => import("@/components/LocationPicker"),
  { ssr: false }
)

interface CartProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
  total: number
}

export function Cart({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, total }: CartProps) {
  const [productCache, setProductCache] = useState<{[key: number]: any}>({})
  const [hasAddedHistoryState, setHasAddedHistoryState] = useState(false)

  useEffect(() => {
    if (isOpen && !hasAddedHistoryState) {
      window.history.pushState({ cartOpen: true }, "");
      setHasAddedHistoryState(true);
      
      const handlePopState = (e: PopStateEvent) => {
        if (isOpen) {
          onClose();
          setHasAddedHistoryState(false);
        }
      };
      window.addEventListener("popstate", handlePopState);
      
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else if (!isOpen && hasAddedHistoryState) {
      // Solo manejar el historial cuando el carrito se cierra intencionalmente
      if (window.history.state && window.history.state.cartOpen) {
        window.history.back();
      }
      setHasAddedHistoryState(false);
    }
  }, [isOpen, onClose, hasAddedHistoryState]);

  // Cargar productos del carrito desde Supabase
  useEffect(() => {
    const loadCartProducts = async () => {
      const newProductCache = { ...productCache }
      for (const cartItem of cart) {
        if (!newProductCache[cartItem.productId]) {
          try {
            const product = await productService.getProductById(cartItem.productId)
            if (product) {
              newProductCache[cartItem.productId] = product
            }
          } catch (error) {
            console.error('Error loading product:', error)
          }
        }
      }
      setProductCache(newProductCache)
    }

    if (cart.length > 0) {
      loadCartProducts()
    }
  }, [cart])
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    location: "",
    street: "",
    number: "",
    city: "",
    mapsLink: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [deliveryOption, setDeliveryOption] = useState<"retiro" | "envio">("retiro")
  const [addressMode, setAddressMode] = useState<"structured" | "maps">("structured")
  const [showWarning, setShowWarning] = useState(false)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean; location: boolean; street: boolean; number: boolean; city: boolean; mapsLink: boolean }>({ 
    name: false, 
    phone: false, 
    location: false,
    street: false,
    number: false,
    city: false,
    mapsLink: false
  });

  // Verificar si necesita ubicación (solo para envío con cadetería)
  const needsLocation = deliveryOption === "envio" && (paymentMethod === "Efectivo" || paymentMethod === "Débito" || paymentMethod === "Transferencia");

  // Verificar si la dirección está completa según el modo elegido
  const isAddressComplete = addressMode === "structured" 
    ? (customerInfo.street && customerInfo.number && customerInfo.city)
    : customerInfo.mapsLink;
    
  const fullAddress = addressMode === "structured" 
    ? (isAddressComplete ? `${customerInfo.street} ${customerInfo.number}, ${customerInfo.city}` : "")
    : customerInfo.mapsLink;

  // Mostrar advertencia si ya se eligió forma de pago y retiro/envío, pero falta información
  const shouldShowAutoWarning = (
    paymentMethod &&
    (paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" || paymentMethod === "Tarjeta de débito" || deliveryOption) &&
    (!customerInfo.name || !customerInfo.phone || (needsLocation && !isAddressComplete))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const formatPriceForWhatsApp = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getProduct = (productId: number) => {
    const product = productCache[productId] || products.find((p) => p.id === productId)
    return product
  }

  const generateWhatsAppMessage = () => {
    let message = `🛍️ *PEDIDO PERMAY*\n\n`;
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📱 *Teléfono:* ${customerInfo.phone}\n`;
    
    // Agregar ubicación si está disponible (solo para envío con cadetería)
    if (isAddressComplete && deliveryOption === "envio" && (paymentMethod === "Efectivo" || paymentMethod === "Débito" || paymentMethod === "Transferencia")) {
      message += `📍 *Ubicación:* ${fullAddress}\n`;
    }
    message += `\n`;

    message += `💳 *Forma de pago:* ${paymentMethod}\n`;

    if (paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" || paymentMethod === "Tarjeta de débito") {
      message += `🏬 *Retiro:* Presencial en San Juan 1248, M5500 Mendoza\n\n`;
    } else {
      if (deliveryOption === "retiro") {
        message += `🏬 *Retiro:* Presencial en San Juan 1248, M5500 Mendoza\n\n`;
      } else {
        message += `🚚 *Envío con cadetería local disponible*\n`;
        message += `Coordinaremos el envío por WhatsApp tras tu pedido (horarios y valores según la distancia).\n`;
        message += `Envíanos tu ubicación a través de maps para calcular el costo exacto y coordinar horario\n\n`;
      }
    }

    message += `🛍️ *PRODUCTOS:*\n`;
    cart.forEach((item) => {
      const product = getProduct(item.productId);
      if (product) {
        message += `• ${product.name}\n`;
        message += `  Marca: ${product.brand}\n`;
        message += `  Cantidad: ${item.quantity}\n`;
        message += `  Precio: ${formatPriceForWhatsApp(product.price * item.quantity)}\n\n`;
      }
    });

    message += `💰 *TOTAL: ${formatPriceForWhatsApp(total)}*\n\n`;

    message += `¡Gracias por elegir Permay!`;

    return encodeURIComponent(message);
  }

  const handleSendWhatsApp = () => {
    const needsLocation = deliveryOption === "envio" && (paymentMethod === "Efectivo" || paymentMethod === "Débito" || paymentMethod === "Transferencia");
    setTouched({ 
      name: true, 
      phone: true, 
      location: needsLocation,
      street: needsLocation && addressMode === "structured",
      number: needsLocation && addressMode === "structured",
      city: needsLocation && addressMode === "structured",
      mapsLink: needsLocation && addressMode === "maps"
    });
    
    if (!customerInfo.name || !customerInfo.phone || (needsLocation && !isAddressComplete)) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/5492614295880?text=${message}`;
    window.open(whatsappUrl, "_blank");
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    const mapsLink = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    setCustomerInfo(prev => ({
      ...prev,
      mapsLink
    }))
    setAddressMode("maps")
    setIsLocationPickerOpen(false)
    
    // Forzar actualización del estado touched para revalidar el formulario
    setTouched(prev => ({
      ...prev,
      mapsLink: true
    }))
  }

  const isFormValid = customerInfo.name && customerInfo.phone && (!needsLocation || isAddressComplete) && cart.length > 0

  // Debug: log para verificar estado del formulario
  useEffect(() => {
    console.log('Form validation state:', {
      name: customerInfo.name,
      phone: customerInfo.phone,
      needsLocation,
      isAddressComplete,
      addressMode,
      mapsLink: customerInfo.mapsLink,
      isFormValid
    })
  }, [customerInfo.name, customerInfo.phone, needsLocation, isAddressComplete, addressMode, customerInfo.mapsLink, isFormValid])

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl p-3">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription className="text-xs">
            {cart.length === 0
              ? "Tu carrito está vacío"
              : `${cart.length} producto${cart.length > 1 ? "s" : ""} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Tu carrito está vacío</p>
                <p className="text-xs text-gray-400">Agrega productos para comenzar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="overflow-y-auto space-y-2 pb-2 flex-1 min-h-0">
                {cart.map((item) => {
                  const product = getProduct(item.productId)
                  if (!product) return null

                  return (
                    <div key={item.productId} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                      <div className="flex gap-2 items-start">
                        <img
                          src={product.image || "/placeholder.svg?height=60&width=60"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs line-clamp-2 mb-1">{product.name}</h4>
                          <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-bold text-permay-primary text-sm">{formatPrice(product.price)}</span>
                              <span className="text-[10px] text-gray-500">Precio unitario</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium w-6 text-center text-xs">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
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

              {/* Información y opciones - con scroll independiente */}
              <div className="border-t bg-white flex-shrink-0">
                <div className="overflow-y-auto px-4 max-h-[600px]">
                  <Separator />

                  {/* Customer Info */}
                  <div className="space-y-4 py-4">
                    <h3 className="font-semibold text-base mb-3">Información de contacto</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                            Nombre *
                          </Label>
                          <Input
                            id="name"
                            placeholder="Tu nombre"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                            className={`text-sm h-10 ${(!customerInfo.name && (touched.name || showWarning)) ? "border-red-500" : ""}`}
                          />
                          {(!customerInfo.name && (touched.name || showWarning || shouldShowAutoWarning)) && (
                            <p className="text-red-600 text-xs mt-2">Nombre obligatorio</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                            Teléfono *
                          </Label>
                          <Input
                            id="phone"
                            placeholder="Tu teléfono"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                            className={`text-sm h-10 ${(!customerInfo.phone && (touched.phone || showWarning)) ? "border-red-500" : ""}`}
                          />
                          {(!customerInfo.phone && (touched.phone || showWarning || shouldShowAutoWarning)) && (
                            <p className="text-red-600 text-xs mt-2">Teléfono obligatorio</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Campos de dirección para delivery */}
                      {deliveryOption === "envio" && (paymentMethod === "Efectivo" || paymentMethod === "Débito" || paymentMethod === "Transferencia") && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-10 text-sm font-medium">
                              <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Agregar dirección
                              </span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 mt-4">
                            {/* Selector de modo de dirección */}
                            <div className="flex gap-2">
                              <Button 
                                type="button"
                                variant={addressMode === "structured" ? "default" : "outline"} 
                                size="sm" 
                                className="flex-1 h-9 text-sm"
                                onClick={() => setAddressMode("structured")}
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Dirección
                              </Button>
                              <Button 
                                type="button"
                                variant={addressMode === "maps" ? "default" : "outline"} 
                                size="sm" 
                                className="flex-1 h-9 text-sm"
                                onClick={() => setAddressMode("maps")}
                              >
                                <Map className="h-4 w-4 mr-2" />
                                Maps
                              </Button>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="h-9 text-sm px-3"
                                onClick={() => setIsLocationPickerOpen(true)}
                                title="Seleccionar en mapa"
                              >
                                <Map className="h-4 w-4" />
                              </Button>
                            </div>

                            {addressMode === "structured" ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="street" className="text-sm font-medium mb-2 block">
                                      Calle *
                                    </Label>
                                    <Input
                                      id="street"
                                      placeholder="Ej: San Martín"
                                      value={customerInfo.street}
                                      onChange={(e) => setCustomerInfo({ ...customerInfo, street: e.target.value })}
                                      onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
                                      className={`text-sm h-10 ${(!customerInfo.street && (touched.street || showWarning)) ? "border-red-500" : ""}`}
                                    />
                                    {(!customerInfo.street && (touched.street || showWarning || shouldShowAutoWarning)) && (
                                      <p className="text-red-600 text-xs mt-2">Calle obligatoria</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label htmlFor="number" className="text-sm font-medium mb-2 block">
                                      Número *
                                    </Label>
                                    <Input
                                      id="number"
                                      placeholder="Ej: 1248"
                                      value={customerInfo.number}
                                      onChange={(e) => setCustomerInfo({ ...customerInfo, number: e.target.value })}
                                      onBlur={() => setTouched((prev) => ({ ...prev, number: true }))}
                                      className={`text-sm h-10 ${(!customerInfo.number && (touched.number || showWarning)) ? "border-red-500" : ""}`}
                                    />
                                    {(!customerInfo.number && (touched.number || showWarning || shouldShowAutoWarning)) && (
                                      <p className="text-red-600 text-xs mt-2">Número obligatorio</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="city" className="text-sm font-medium mb-2 block">
                                    Localidad *
                                  </Label>
                                  <Input
                                    id="city"
                                    placeholder="Ej: Mendoza"
                                    value={customerInfo.city}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                                    onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                                    className={`text-sm h-10 ${(!customerInfo.city && (touched.city || showWarning)) ? "border-red-500" : ""}`}
                                  />
                                  {(!customerInfo.city && (touched.city || showWarning || shouldShowAutoWarning)) && (
                                    <p className="text-red-600 text-xs mt-2">Localidad obligatoria</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Label htmlFor="mapsLink" className="text-sm font-medium mb-2 block">
                                  Enlace de Google Maps *
                                </Label>
                                <Input
                                  id="mapsLink"
                                  placeholder="Pega aquí tu enlace de Google Maps"
                                  value={customerInfo.mapsLink}
                                  onChange={(e) => setCustomerInfo({ ...customerInfo, mapsLink: e.target.value })}
                                  onBlur={() => setTouched((prev) => ({ ...prev, mapsLink: true }))}
                                  className={`text-sm h-10 ${(!customerInfo.mapsLink && (touched.mapsLink || showWarning)) ? "border-red-500" : ""}`}
                                />
                                {(!customerInfo.mapsLink && (touched.mapsLink || showWarning || shouldShowAutoWarning)) && (
                                  <p className="text-red-600 text-xs mt-2">Enlace obligatorio</p>
                                )}
                                <p className="text-gray-500 text-xs mt-2">
                                  📍 Ve a Google Maps, busca tu ubicación y comparte el enlace
                                </p>
                              </div>
                            )}

                            {isAddressComplete && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-green-700 text-sm font-medium">
                                  {addressMode === "structured" ? "Dirección:" : "Maps:"}
                                </p>
                                <p className="text-green-600 text-xs break-all">{fullAddress}</p>
                              </div>
                            )}
                            
                            {!isAddressComplete && (touched.street || touched.number || touched.city || touched.mapsLink || showWarning || shouldShowAutoWarning) && (
                              <p className="text-gray-600 text-xs">
                                {addressMode === "structured" 
                                  ? "Complete todos los campos"
                                  : "Pegue enlace de Maps"
                                }
                              </p>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Pago y Total */}
                  <div className="space-y-4 py-4">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4" />
                        Forma de pago
                      </h4>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="w-full h-10 text-sm">
                          <SelectValue placeholder="Selecciona método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Efectivo">💵 Efectivo</SelectItem>
                          <SelectItem value="Transferencia">🏦 Transferencia</SelectItem>
                          <SelectItem value="Tarjeta de crédito (hasta 3 cuotas sin interés)">💳 Crédito (3 cuotas)</SelectItem>
                          <SelectItem value="Tarjeta de débito">💳 Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                        <Truck className="h-4 w-4" />
                        Retiro / Envío
                      </h4>
                      {(paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" || paymentMethod === "Tarjeta de débito") ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                            <MapPin className="h-4 w-4" />
                            Solo retiro presencial
                          </div>
                          <p className="text-red-600 text-xs">Con tarjeta solo retiro en tienda</p>
                          <p className="text-gray-600 text-xs mt-1">📍 San Juan 1248, Mendoza</p>
                        </div>
                      ) : (
                        <Select value={deliveryOption} onValueChange={(value: "retiro" | "envio") => setDeliveryOption(value)}>
                          <SelectTrigger className="w-full h-10 text-sm">
                            <SelectValue placeholder="Selecciona opción de entrega" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retiro">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <div>
                                  <div className="font-medium text-sm">Retiro presencial</div>
                                  <div className="text-xs text-gray-500">San Juan 1248, Mendoza</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="envio">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <div>
                                  <div className="font-medium text-sm">Envío con cadetería</div>
                                  <div className="text-xs text-gray-500">Coordinaremos por WhatsApp</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    {/* Total y Botón de Envío - Siempre visible */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-semibold">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          {total ? formatPrice(total) : formatPrice(0)}
                        </span>
                      </div>

                      {paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)" && (
                        <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                          💳 Con tarjeta crédito solo retiro presencial
                        </div>
                      )}

                      <Button
                        onClick={handleSendWhatsApp}
                        disabled={!isFormValid}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 h-12 text-sm font-semibold my-6"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar pedido por WhatsApp
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-2">
                        Al enviar serás redirigido a WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
    
    <LocationPicker
      isOpen={isLocationPickerOpen}
      onClose={() => setIsLocationPickerOpen(false)}
      onLocationSelect={handleLocationSelect}
    />
    </>
  )
  
  // Sincronizar opción de retiro/envío al cambiar método de pago
  useEffect(() => {
    if (paymentMethod === "Tarjeta de crédito (hasta 3 cuotas sin interés)") {
      setDeliveryOption("retiro");
    }
  }, [paymentMethod]);
}
