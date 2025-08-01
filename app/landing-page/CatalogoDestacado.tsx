import { products } from "@/data/products";

export default function CatalogoDestacado() {
  // Tomar los primeros 6 productos destacados
  const destacados = products.slice(0, 6);
  return (
    <section className="w-full max-w-3xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-permay-primary mb-6 text-center">Catálogo Destacado</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {destacados.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-lg border border-green-100 flex flex-col items-center p-4 hover:shadow-2xl transition-all">
            <img src={prod.image} alt={prod.name} className="w-28 h-28 object-contain rounded-lg mb-2 bg-gradient-to-br from-green-50 to-white" />
            <h3 className="font-semibold text-lg text-center text-green-800 line-clamp-2 mb-1">{prod.name}</h3>
            <span className="text-xs text-gray-500 mb-1">{prod.brand}</span>
            <span className="text-permay-primary font-bold text-xl mb-2">${prod.price.toLocaleString("es-AR")}</span>
            <a href="https://wa.me/5491123456789?text=Hola!%20Quiero%20consultar%20por%20{encodeURIComponent(prod.name)}" target="_blank" rel="noopener" className="mt-auto bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow transition">Consultar</a>
          </div>
        ))}
      </div>
    </section>
  );
}
