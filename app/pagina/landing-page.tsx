import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-green-50 flex flex-col items-center px-4 py-8">
      <section className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-green-100">
        <img src="/logonuevo.png" alt="Permay Logo" className="w-32 h-32 object-contain drop-shadow-lg mb-2" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-permay-primary text-center">¡Bienvenido a Permay!</h1>
        <p className="text-lg text-gray-700 text-center max-w-xl">
          Somos tu tienda de productos naturales y saludables en Mendoza. Encontrá calidad, atención personalizada y los mejores precios.
        </p>
        <div className="w-full flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-green-700 mb-1">Ubicación</h2>
            <p className="text-gray-600">San Juan 1248, M5500 Mendoza</p>
            <iframe
              title="Ubicación Permay"
              src="https://www.google.com/maps?q=San+Juan+1248,+Mendoza,+Argentina&output=embed"
              className="w-full h-40 rounded-lg mt-2 border border-green-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-green-700 mb-1">Horarios</h2>
            <ul className="text-gray-600">
              <li>Lunes a Viernes: <span className="font-semibold">10:00 a 19:00</span></li>
              <li>Sábados: <span className="font-semibold">10:00 a 18:00</span></li>
              <li>Domingos y feriados: <span className="font-semibold">Cerrado</span></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center mt-4">
          <a href="https://wa.me/5492614295880" target="_blank" rel="noopener" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12c0 4.556-3.694 8.25-8.25 8.25A8.207 8.207 0 0 1 4.5 18.2l-1.7.45a.75.75 0 0 1-.92-.92l.45-1.7A8.207 8.207 0 0 1 3.75 12c0-4.556 3.694-8.25 8.25-8.25S20.25 7.444 20.25 12Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 11.25c.273.545.682 1.045 1.125 1.5.443.455.955.864 1.5 1.125l.375.188a.75.75 0 0 0 .75-.062l.75-.563a.375.375 0 0 1 .438-.03l1.125.563a.375.375 0 0 1 .188.438c-.13.52-.52 1.25-1.563 1.25-1.5 0-4.5-3-4.5-4.5 0-1.043.73-1.433 1.25-1.563a.375.375 0 0 1 .438.188l.563 1.125a.375.375 0 0 1-.03.438l-.563.75a.75.75 0 0 0-.062.75l.188.375Z" /></svg>
            WhatsApp
          </a>
          <a href="https://www.instagram.com/permayperfumeria/?hl=es" target="_blank" rel="noopener" className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75h-9A2.25 2.25 0 0 0 5.25 6.001v11.998A2.25 2.25 0 0 0 7.5 20.25h9a2.25 2.25 0 0 0 2.25-2.251V6A2.25 2.25 0 0 0 16.5 3.75ZM12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm4.125.375a.375.375 0 1 1 0 .75.375.375 0 0 1 0-.75ZM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
            Instagram
          </a>
        </div>
        <div className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Permay. Todos los derechos reservados.
        </div>
      </section>
    </main>
  );
}
