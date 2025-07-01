"use client"

import { useEffect, useState } from "react"

export function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-permay-primary/20 via-purple-500/10 to-pink-500/20 animate-pulse" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-permay-primary/30 to-purple-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl animate-float-slow" />

      {/* Interactive Mouse Glow */}
      <div
        className="absolute w-96 h-96 bg-gradient-radial from-permay-primary/10 via-purple-500/5 to-transparent rounded-full blur-2xl transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-sparkle opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
    </div>
  )
}
