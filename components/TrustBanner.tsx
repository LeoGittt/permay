"use client"

import { CreditCard, Shield, Users, Award, Truck } from "lucide-react"

export function TrustBanner() {
  const trustItems = [
    {
      icon: CreditCard,
      title: "Todos los medios de pago",
      description: "Efectivo, débito, crédito y transferencia",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      shadowColor: "hover:shadow-blue-200",
    },
    {
      icon: Award,
      title: "La mejor atención",
      description: "Servicio de calidad garantizado",
      color: "text-permay-primary",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      shadowColor: "hover:shadow-purple-200",
    },
    {
      icon: Users,
      title: "Asesoramiento personalizado",
      description: "Te ayudamos a elegir lo mejor para ti",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      shadowColor: "hover:shadow-green-200",
    },
    {
      icon: Shield,
      title: "Compra 100% segura",
      description: "Tu información está protegida",
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      shadowColor: "hover:shadow-orange-200",
    },
    {
      icon: Truck,
      title: "Envíos a domicilio",
      description: "Recibí tus productos en la puerta de tu casa",
      color: "text-rose-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
      shadowColor: "hover:shadow-rose-200",
    },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border-b border-gray-100 py-4 sm:py-12 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-permay-primary/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8">
          {trustItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div
                key={index}
                className={`group flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-3xl transition-all duration-500 hover:shadow-xl ${item.shadowColor} hover:scale-105 bg-white/90 backdrop-blur-sm border border-gray-100/50 hover:border-gray-200 hover:bg-white`}
              >
                <div className={`${item.bgColor} p-2.5 sm:p-4 rounded-full flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300`}>
                  <IconComponent className={`w-5 h-5 sm:w-7 sm:h-7 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight group-hover:text-gray-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed group-hover:text-gray-600 transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Seguinos en Instagram */}
        <div className="mt-6 sm:mt-10 flex justify-center">
          <a
            href="https://www.instagram.com/permayperfumeria/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {/* Instagram icon with verified badge */}
            <span className="relative flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {/* Verified badge */}
              <svg className="absolute -top-1 -right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#1DA1F2"/>
                <path d="M9.5 12.5l2 2 4-4.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>Seguinos en Instagram</span>
          </a>
        </div>
      </div>
    </div>
  )
}