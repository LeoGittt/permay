"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook personalizado para manejar modales con historial del navegador
 * Evita que el botón "atrás" del móvil cierre la aplicación cuando hay un modal abierto
 */
export function useModalHistory<T>() {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  // Manejar el evento popstate (botón atrás del navegador)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedItem) {
        setSelectedItem(null)
        // Prevenir la propagación para evitar navegación adicional
        event.preventDefault()
      }
    }

    // Solo agregar el listener si hay un item seleccionado
    if (selectedItem) {
      window.addEventListener("popstate", handlePopState)
    }
    
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [selectedItem])

  // Función para abrir el modal y agregar al historial
  const openModal = useCallback((item: T) => {
    setSelectedItem(item)
    // Agregar una entrada al historial cuando se abre el modal
    window.history.pushState(
      { modalOpen: true, timestamp: Date.now() }, 
      "", 
      window.location.href
    )
  }, [])

  // Función para cerrar el modal
  const closeModal = useCallback(() => {
    setSelectedItem(null)
    // Si hay una entrada del modal en el historial, ir hacia atrás
    if (window.history.state?.modalOpen) {
      window.history.back()
    }
  }, [])

  return {
    selectedItem,
    isOpen: !!selectedItem,
    openModal,
    closeModal,
  }
}
