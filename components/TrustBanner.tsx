"use client"

import { CreditCard, Shield, Users, Award } from "lucide-react"

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
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border-b border-gray-100 py-4 sm:py-12 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-permay-primary/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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
      </div>
    </div>
  )
}