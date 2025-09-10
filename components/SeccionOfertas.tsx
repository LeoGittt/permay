"use client"

import { useProductsOnSale } from "@/hooks/useProductsOnSale"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface OfertasProps {
  limit?: number
  className?: string
  compact?: boolean // Nueva prop para versión compacta
}

export default function SeccionOfertas({ limit = 6, className = "", compact = false }: OfertasProps) {
  const { products, loading, error } = useProductsOnSale(limit)

  if (loading) {
    return (
      <section className={`w-full max-w-6xl mx-auto my-10 ${className}`}>
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">🔥 Ofertas Especiales</h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`w-full max-w-6xl mx-auto my-10 ${className}`}>
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">🔥 Ofertas Especiales</h2>
        <div className="text-center text-gray-500 py-8">
          {error}
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return null // No mostrar la sección si no hay ofertas
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const createWhatsAppLink = (product: any) => {
    const message = `Hola! Quiero consultar por la OFERTA de: ${product.name}`
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/5492614295880?text=${encodedMessage}`
  }

  return (
    <section className={`w-full max-w-6xl mx-auto my-10 ${className}`}>
      <div className={`text-center ${compact ? 'mb-4' : 'mb-8'}`}>
        <h2 className={`font-bold text-red-600 mb-2 ${compact ? 'text-2xl' : 'text-3xl'}`}>
          🔥 Ofertas Especiales
        </h2>
        {!compact && (
          <p className="text-gray-600">No te pierdas estas increíbles ofertas por tiempo limitado</p>
        )}
      </div>
      
      <div className={`grid gap-4 ${
        compact 
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8" 
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      }`}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-lg border-2 border-red-200 flex flex-col items-center p-4 hover:shadow-2xl hover:border-red-300 transition-all duration-300 relative overflow-hidden"
          >
            {/* Badge de oferta */}
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-red-500 text-white text-xs font-bold animate-pulse">
                OFERTA
              </Badge>
            </div>

            {/* Imagen del producto */}
            <div className={`w-full mb-3 relative ${compact ? 'h-24' : 'h-32'}`}>
              <img 
                src={product.image || "/placeholder.svg?height=128&width=128"} 
                alt={product.name} 
                className="w-full h-full object-contain rounded-lg bg-gradient-to-br from-red-50 to-white"
                loading="lazy"
              />
            </div>

            {/* Información del producto */}
            <div className="flex flex-col items-center text-center flex-1">
              <h3 className={`font-semibold text-gray-800 line-clamp-2 mb-1 flex items-center ${
                compact ? 'text-xs min-h-[2rem]' : 'text-sm min-h-[2.5rem]'
              }`}>
                {product.name}
              </h3>
              
              <span className={`text-gray-500 mb-2 ${compact ? 'text-xs' : 'text-xs'}`}>
                {product.brand}
              </span>
              
              <div className="mb-3">
                <span className={`text-red-600 font-bold ${compact ? 'text-base' : 'text-lg'}`}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Botón de WhatsApp */}
              <a 
                href={createWhatsAppLink(product)}
                target="_blank" 
                rel="noopener noreferrer"
                className={`mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                  compact ? 'text-xs' : 'text-sm'
                }`}
              >
                {compact ? 'Consultar' : 'Consultar Oferta'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje adicional */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          * Ofertas válidas hasta agotar stock. Consulta disponibilidad vía WhatsApp.
        </p>
      </div>
    </section>
  )
}
