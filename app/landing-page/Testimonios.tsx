export default function Testimonios() {
  return (
    <section className="w-full max-w-3xl mx-auto my-12 py-8 px-4 bg-white rounded-2xl shadow-lg border border-permay-primary/10 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-permay-primary mb-6 text-center">Lo que dicen nuestros clientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="flex flex-col items-center text-center bg-permay-primary/5 rounded-xl p-4">
          <span className="text-3xl">🌟🌟🌟🌟🌟</span>
          <p className="text-gray-700 mt-2 mb-1">“Excelente atención y productos de primera. ¡Siempre vuelvo!”</p>
          <span className="text-permay-primary font-semibold mt-2">María G.</span>
        </div>
        <div className="flex flex-col items-center text-center bg-permay-primary/5 rounded-xl p-4">
          <span className="text-3xl">🌟🌟🌟🌟🌟</span>
          <p className="text-gray-700 mt-2 mb-1">“Me asesoraron por WhatsApp y recibí mi pedido rapidísimo. ¡Recomiendo!”</p>
          <span className="text-permay-primary font-semibold mt-2">Lucas P.</span>
        </div>
        <div className="flex flex-col items-center text-center bg-permay-primary/5 rounded-xl p-4">
          <span className="text-3xl">🌟🌟🌟🌟🌟</span>
          <p className="text-gray-700 mt-2 mb-1">“Gran variedad y precios. El local es hermoso y siempre tienen promos.”</p>
          <span className="text-permay-primary font-semibold mt-2">Sofía R.</span>
        </div>
      </div>
    </section>
  );
}
