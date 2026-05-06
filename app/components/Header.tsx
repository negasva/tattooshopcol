'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="bg-trust-dark text-white py-3 px-4 text-center text-sm md:text-base">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <span>🚚 Envíos seguros a todo el país</span>
          <span>⭐ 5+ Años de Trayectoria</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-trust-dark">
            ✨ TattooShop Colombia
          </h1>
          <nav className="hidden md:flex gap-6">
            <button className="text-trust-dark hover:text-trust-green transition">Inicio</button>
            <button className="text-trust-dark hover:text-trust-green transition">Productos</button>
            <button className="text-trust-dark hover:text-trust-green transition">Contacto</button>
          </nav>
        </div>
      </div>
    </header>
  );
}
