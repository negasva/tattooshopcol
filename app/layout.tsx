import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

const displayFont = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = DM_Mono({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`} style={{ fontFeatureSettings: '"cv11" 1' }}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
