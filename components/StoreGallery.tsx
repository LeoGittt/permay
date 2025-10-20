"use client"

import { useState } from "react"
import Image from "next/image"
import { TrustBanner } from "./TrustBanner"
import { X } from "lucide-react"

export function StoreGallery() {
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string, title: string} | null>(null)
  const storeImages = [
    
    {
      src: "/SS.jpeg", 
      alt: "Productos en exhibición",
      title: "Amplia variedad"
    },
    {
      src: "/S.jpeg",
      alt: "Atención personalizada",
      title: "Asesoramiento"
    },
    
  ]

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-permay-primary/5 py-8 sm:py-16 border-t border-gray-100 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-permay-primary/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-permay-primary/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        {/* Banner de confianza arriba */}
        <TrustBanner />
        
        {/* Título mejorado */}
        <div className="text-center mb-8 sm:mb-12 mt-8 sm:mt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-permay-primary to-permay-primary/80 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0v-4" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-permay-primary bg-clip-text text-transparent mb-3">
            Conocé nuestro local
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Te esperamos en <span className="font-semibold text-permay-primary">San Juan 1248, Mendoza</span>. 
            Un espacio pensado para que encuentres todo lo que necesitás con la mejor atención.
          </p>
        </div>

        {/* Galería de fotos mejorada */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {storeImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 hover:scale-105 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white text-sm sm:text-base font-bold leading-tight drop-shadow-lg">
                  {image.title}
                </h3>
              </div>
              {/* Brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Call to action mejorado */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="https://maps.app.goo.gl/JPma6Ryj9YS3iR198"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-permay-primary to-permay-primary/90 hover:from-permay-primary/90 hover:to-permay-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:shadow-permay-primary/25 hover:scale-105 transform"
          >
            <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors duration-300">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="tracking-wide">Cómo llegar</span>
          </a>
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedImage(null)
            }
          }}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Imagen ampliada */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  width={800}
                  height={600}
                  className="object-contain rounded-xl shadow-2xl max-w-full max-h-[85vh]"
                  sizes="(max-width: 768px) 95vw, 85vw"
                  priority
                  onError={(e) => {
                    console.log('Error loading image:', selectedImage.src)
                  }}
                />
                
                {/* Título flotante */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                  <h3 className="text-white text-base font-semibold text-center whitespace-nowrap">
                    {selectedImage.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}