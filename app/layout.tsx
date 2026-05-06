import type { Metadata } from 'next';
import Header from './components/Header';
import WhatsAppButton from './components/WhatsAppButton';
import './globals.css';

export const metadata: Metadata = {
  title: 'TattooShop Colombia - Tienda de Tatuajes',
  description: 'Tienda en línea de productos para tatuajes con envíos seguros a toda Colombia. Wompi integrado para pagos seguros.',
  keywords: 'tatuajes, tinta, agujas, máquinas de tatuaje, Colombia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white">
        <Header />
        <main>{children}</main>
        <WhatsAppButton />
        <footer className="bg-trust-dark text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p className="mb-2">© 2024 TattooShop Colombia. Todos los derechos reservados.</p>
            <p>Envíos seguros a toda Colombia | 5+ Años de Trayectoria</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
