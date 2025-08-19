"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/useCart"
import { orderService, productService } from "@/lib/supabase-services"
import type { CreateOrderData, Product } from "@/types/product"

interface CustomerInfo {
  name: string
  phone: string
  email?: string
}

interface CheckoutData extends CustomerInfo {
  deliveryOption: 'retiro' | 'envio'
  paymentMethod: string
  notes?: string
}

export function useCartWithSupabase() {
  const cart = useCart()
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<number | null>(null)
  const [cartTotal, setCartTotal] = useState(0)

  // Calcular total del carrito usando productos de Supabase
  const calculateCartTotal = async () => {
    if (cart.cart.length === 0) {
      setCartTotal(0)
      return 0
    }

    try {
      let total = 0
      for (const cartItem of cart.cart) {
        const product = await productService.getProductById(cartItem.productId)
        if (product) {
          total += product.price * cartItem.quantity
        }
      }
      setCartTotal(total)
      return total
    } catch (error) {
      console.error('Error calculating cart total:', error)
      setCartTotal(0)
      return 0
    }
  }

  // Recalcular total cuando cambie el carrito
  useEffect(() => {
    calculateCartTotal()
  }, [cart.cart])

  // Función que retorna el total calculado
  const getCartTotal = () => cartTotal

  const submitOrder = async (checkoutData: CheckoutData): Promise<{ success: boolean; orderId?: number; error?: string }> => {
    if (cart.cart.length === 0) {
      return { success: false, error: "El carrito está vacío" }
    }

    setIsSubmittingOrder(true)

    try {
      // Obtener los detalles de los productos para tener los precios actualizados
      const orderItems = []
      
      for (const cartItem of cart.cart) {
        const product = await productService.getProductById(cartItem.productId)
        if (product) {
          orderItems.push({
            product_id: cartItem.productId,
            quantity: cartItem.quantity,
            unit_price: product.price
          })
        }
      }

      if (orderItems.length === 0) {
        return { success: false, error: "No se pudieron encontrar los productos del carrito" }
      }

      // Crear la orden en Supabase
      const orderData: CreateOrderData = {
        customer_name: checkoutData.name,
        customer_phone: checkoutData.phone,
        customer_email: checkoutData.email,
        delivery_option: checkoutData.deliveryOption,
        payment_method: checkoutData.paymentMethod,
        notes: checkoutData.notes,
        items: orderItems
      }

      const order = await orderService.createOrder(orderData)
      
      // Limpiar el carrito después de crear la orden
      cart.clearCart()
      
      setLastOrderId(order.id)
      
      return { success: true, orderId: order.id }

    } catch (error) {
      console.error('Error creating order:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al procesar el pedido" 
      }
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const generateWhatsAppMessage = async (checkoutData: CheckoutData, orderId?: number) => {
    try {
      // Obtener los detalles de los productos
      const itemDetails = []
      for (const cartItem of cart.cart) {
        const product = await productService.getProductById(cartItem.productId)
        if (product) {
          itemDetails.push({
            name: product.name,
            quantity: cartItem.quantity,
            price: product.price
          })
        }
      }

      const items = itemDetails.map(item => 
        `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
      ).join('\n')

      const total = formatPrice(await calculateCartTotal())
      
      const orderInfo = orderId ? `Orden #${orderId}\n\n` : ''
      
      const deliveryInfo = checkoutData.deliveryOption === 'retiro' 
        ? '📍 Retiro en tienda: San Juan 1248, M5500 Mendoza'
        : '🚚 Envío a domicilio (coordinaremos los detalles)'

      const message = `¡Hola! Quiero realizar el siguiente pedido:

${orderInfo}👤 *Cliente:* ${checkoutData.name}
📱 *Teléfono:* ${checkoutData.phone}
${checkoutData.email ? `📧 *Email:* ${checkoutData.email}\n` : ''}
💳 *Método de pago:* ${checkoutData.paymentMethod}
${deliveryInfo}

📦 *Productos:*
${items}

💰 *Total: ${total}*
${checkoutData.notes ? `\n📝 *Notas:* ${checkoutData.notes}` : ''}

¡Gracias!`

      return message
    } catch (error) {
      console.error('Error generating WhatsApp message:', error)
      return "Error al generar el mensaje"
    }
  }

  const sendWhatsAppOrder = async (checkoutData: CheckoutData, orderId?: number) => {
    const phoneNumber = "5492613000787" // Tu número de WhatsApp
    const message = await generateWhatsAppMessage(checkoutData, orderId)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return {
    ...cart,
    getCartTotal,
    submitOrder,
    sendWhatsAppOrder,
    generateWhatsAppMessage,
    isSubmittingOrder,
    lastOrderId
  }
}
