"use client";
import { useState } from "react";
import { X, Truck } from "lucide-react";

export function DeliveryBanner() {
  const [visible, setVisible] = useState(true);
  const [showBubble, setShowBubble] = useState(false);

  const handleClose = () => {
    setVisible(false);
    setShowBubble(true);
  };

  const handleBubbleClick = () => {
    setVisible(true);
    setShowBubble(false);
  };

  return (
    <>
      {visible && (
        <div className="w-full bg-permay-primary text-white flex items-center justify-center px-4 py-2 gap-2 shadow-md animate-fade-in">
          <Truck className="w-5 h-5 mr-2 text-white animate-bounce" />
          <span className="text-xs sm:text-sm font-semibold text-center">
            ENVÍOS CON CADETERÍA, ¡CONSULTANOS!<br className="sm:hidden" />
            <span className="font-normal">Estamos en <b>San Juan 1248, M5500 Mendoza</b>.<br className="sm:hidden" />
            Lunes a Viernes de 9:30 a 15 y de 17:30 a 21 hs. Sábados de 8:30 a 15.</span>
          </span>
          <button
            className="ml-3 p-1 rounded-full hover:bg-permay-primary/80 focus:outline-none"
            onClick={handleClose}
            aria-label="Cerrar aviso de envíos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {showBubble && (
        <button
          className="fixed bottom-24 right-4 z-[101] bg-permay-primary border border-permay-primary shadow-lg rounded-full p-3 flex items-center justify-center hover:bg-permay-primary/80 transition-all animate-fade-in"
          onClick={handleBubbleClick}
          aria-label="Mostrar información de envíos"
        >
          <Truck className="w-6 h-6 text-white animate-bounce" />
        </button>
      )}
    </>
  );
}
