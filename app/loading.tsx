"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Loading() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // El loading se ocultará cuando la página esté lista
    const timer = setTimeout(() => setIsVisible(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-white to-permay-primary/5 transition-opacity duration-500 ${
        !isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo con animación */}
        <div className="relative w-32 h-32 animate-pulse">
          <Image
            src="/logonuevo.png"
            alt="Permay Loading"
            fill
            className="object-contain drop-shadow-xl"
          />
        </div>
        
        {/* Texto */}
        <h1 className="text-2xl font-black text-permay-primary tracking-tighter">Permay</h1>
        
        {/* Animación de carga */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-permay-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 rounded-full bg-permay-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-permay-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
