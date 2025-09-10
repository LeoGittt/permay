"use client";
import PorQueElegirnos from "./PorQueElegirnos";
import Testimonios from "./Testimonios";
import SeccionOfertas from "@/components/SeccionOfertas";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Sección Hero: Encabezado */}
      <section className="w-full bg-gradient-to-b from-permay-primary/10 to-white py-16 md:py-24 flex flex-col items-center relative overflow-hidden shadow-lg mb-12">
        <div className="absolute inset-0 opacity-5 bg-[url('/logo.jpeg')] bg-center bg-no-repeat bg-contain pointer-events-none" />
        <a href="/" aria-label="Ir al catálogo">
          <img
            src="/logo.jpeg"
            alt="Permay Logo"
            className="w-36 h-36 md:w-48 md:h-48 rounded-full shadow-2xl border-6 border-permay-primary mb-6 bg-white z-10 hover:scale-105 transition-transform duration-300"
          />
        </a>
        <h1 className="text-4xl md:text-7xl font-extrabold text-permay-primary text-center drop-shadow-xl z-10 tracking-tight">
          Permay
        </h1>
        <p className="text-lg md:text-2xl text-permay-primary/90 text-center max-w-2xl mt-4 font-semibold z-10 leading-snug px-4">
          Tu destino de belleza, salud y naturaleza en un solo lugar.
        </p>
        
        {/* Botones de CTA */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center z-10 px-4">
          <a
            href="https://wa.me/5491123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-permay-primary hover:bg-permay-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition duration-300 text-base md:text-lg w-full md:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2.87c-4.4 0-7.98 3.58-7.98 7.98 0 1.48.42 2.89 1.22 4.12l-1.28 4.67 4.79-1.26c1.18.66 2.5 1.02 3.25 1.02h.01c4.4 0 7.98-3.58 7.98-7.98s-3.58-7.98-7.98-7.98zm3.2 12.87c-.19.46-1.12.9-.68 1.48.44.58 1.63.53 2.12.44.38-.07.82-.19 1.1-.38.28-.19.44-.38.62-.57.19-.19.38-.38.57-.68.19-.3.38-.57.38-.85.0-1.18-.57-1.76-.85-2.04-.19-.3-.57-.46-.85-.62-.28-.19-.57-.19-.85-.19-.28.0-.57.0-.85.19-.28.19-.57.38-.68.57-.19.19-.3.38-.46.68-.19.3-.28.57-.46.85-.09.28-.28.57-.46.85-.19.19-.38.38-.57.57-.19.19-.38.38-.57.57z"/></svg>
            Contactar por WhatsApp
          </a>
          <a
            href="https://www.instagram.com/permayperfumeria/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border-2 border-permay-primary text-permay-primary font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition duration-300 text-base md:text-lg w-full md:w-auto justify-center hover:bg-permay-primary hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 3.75h-9A2.25 2.25 0 0 0 5.25 6.001v11.998A2.25 2.25 0 0 0 7.5 20.25h9a2.25 2.25 0 0 0 2.25-2.251V6A2.25 2.25 0 0 0 16.5 3.75ZM12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm4.125.375a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75ZM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
            Ver en Instagram
          </a>
        </div>
      </section>

      {/* Contenedor principal para el resto del contenido */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <PorQueElegirnos />
        
        {/* Sección de Ofertas */}
        <SeccionOfertas limit={6} className="my-16" />
        
        <Testimonios />

        {/* Sección de Contacto y Horarios */}
        <section className="my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-permay-primary mb-8">
            Encuéntranos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Tarjeta de Ubicación */}
            <div className="bg-white rounded-3xl shadow-xl border border-permay-primary/10 p-8 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold text-permay-primary mb-4">
                Nuestra Ubicación
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                San Juan 1248, M5500 Mendoza
              </p>
              <iframe
                title="Ubicación Permay"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3349.508544458925!2d-68.83783778481358!3d-32.89456208038753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e090f42b3112b%3A0x7d6c5c0c9c3e9a0c!2sSan%20Juan%201248%2C%20M5500%20Mendoza!5e0!3m2!1ses-419!2sar!4v1689255675200!5m2!1ses-419!2sar"
                className="w-full h-64 md:h-80 rounded-2xl border border-permay-primary/20"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
            {/* Tarjeta de Horarios */}
            <div className="bg-white rounded-3xl shadow-xl border border-permay-primary/10 p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold text-permay-primary mb-4">
                Horarios de Atención
              </h3>
              <ul className="text-gray-600 text-lg space-y-2">
                <li>Lunes a Viernes: <span className="font-semibold text-permay-primary">10:00 a 19:00</span></li>
                <li>Sábados: <span className="font-semibold text-permay-primary">10:00 a 18:00</span></li>
                <li>Domingos y feriados: <span className="font-semibold text-red-500">Cerrado</span></li>
              </ul>
              <p className="mt-6 text-sm text-gray-500">
                <a href="tel:+542614295880" className="hover:underline">Teléfono: +54 261 429-5880</a>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Pie de página (Footer) */}
      <footer className="w-full py-10 bg-permay-primary/10 border-t border-permay-primary/20 text-center text-permay-primary text-sm mt-12 flex flex-col items-center gap-4">
        <div className="flex flex-wrap gap-4 md:gap-8 justify-center font-medium">
          <a href="https://wa.me/5492614295880" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-permay-primary/80">WhatsApp</a>
          <a href="https://www.instagram.com/permayperfumeria/?hl=es" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-permay-primary/80">Instagram</a>
          <a href="https://www.google.com/maps/place/San+Juan+1248,+M5500+Mendoza/@-32.8945621,-68.8378378,17z/data=!3m1!4b1!4m5!3m4!1s0x967e090f42b3112b:0x7d6c5c0c9c3e9a0c!8m2!3d-32.8945667!4d-68.8356491" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-permay-primary/80">Ubicación</a>
        </div>
        <div className="text-gray-600">
          © {new Date().getFullYear()} Permay. Todos los derechos reservados.
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Sitio desarrollado con ❤️
        </div>
      </footer>
    </main>
  );
}