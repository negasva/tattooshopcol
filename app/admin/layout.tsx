import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google';
import '../globals.css';

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
  title: 'Admin - TattooShop Colombia',
  description: 'Panel de administración de TattooShop Colombia',
  icons: {
    icon: '/logo-marca-yellow.svg',
    shortcut: '/logo-marca-yellow.svg',
  },
};

export default function AdminLayout({
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
