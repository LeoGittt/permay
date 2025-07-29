"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppFloatProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppFloat({ 
  phoneNumber = "5492613000787", 
  message = "Hola! Me gustaría obtener más información sobre sus productos."
}: WhatsAppFloatProps) {
  const handleWhatsAppContact = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleWhatsAppContact}
        className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
      </Button>
    </div>
  )
}
