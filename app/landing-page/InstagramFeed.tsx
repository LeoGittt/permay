export default function InstagramFeed() {
  return (
    <div className="w-full flex flex-col items-center my-8">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">Últimas novedades en Instagram</h2>
      <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-lg border border-pink-200">
        <iframe
          src="https://www.instagram.com/permaysalud/embed"
          className="w-full h-[500px] bg-white"
          allowTransparency={true}
          frameBorder={0}
          scrolling="no"
          title="Instagram Permay"
        ></iframe>
      </div>
    </div>
  );
}
