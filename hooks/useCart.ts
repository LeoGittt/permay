"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/types/cart"
import { products } from "@/data/products"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("permay-cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("permay-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (productId: number, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId)

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prevCart, { productId, quantity }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const clearCart = () => {
    setCart([])
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount,
    clearCart,
  }
}
