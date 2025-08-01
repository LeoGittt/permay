export default function PorQueElegirnos() {
  return (
    <section className="w-full max-w-4xl mx-auto my-12 py-8 px-4 bg-white rounded-2xl shadow-lg border border-permay-primary/10 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-permay-primary mb-6 text-center">¿Por qué elegir Permay?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
        <div className="flex flex-col items-center text-center">
          <span className="bg-permay-primary/10 text-permay-primary rounded-full p-4 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 2.5 3 5 3 5s3-2.5 3-5c0-1.657-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" /></svg>
          </span>
          <span className="font-semibold text-permay-primary">Atención personalizada</span>
          <span className="text-gray-500 text-sm mt-1">Te asesoramos en cada compra</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="bg-permay-primary/10 text-permay-primary rounded-full p-4 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4 0 3 4 6 4 6s4-3 4-6c0-2.21-1.79-4-4-4z" /><circle cx="12" cy="12" r="10" /></svg>
          </span>
          <span className="font-semibold text-permay-primary">Productos de calidad</span>
          <span className="text-gray-500 text-sm mt-1">Solo marcas confiables y naturales</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="bg-permay-primary/10 text-permay-primary rounded-full p-4 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 0 0-10 0v2a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" /></svg>
          </span>
          <span className="font-semibold text-permay-primary">Precios accesibles</span>
          <span className="text-gray-500 text-sm mt-1">Ofertas y promos todo el año</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="bg-permay-primary/10 text-permay-primary rounded-full p-4 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
          </span>
          <span className="font-semibold text-permay-primary">Rápida respuesta</span>
          <span className="text-gray-500 text-sm mt-1">Consultá por WhatsApp y te respondemos al instante</span>
        </div>
      </div>
    </section>
  );
}
