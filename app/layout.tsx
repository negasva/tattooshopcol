import type { Metadata } from 'next';
import Script from 'next/script';
import { Bebas_Neue, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import WhatsAppButton from './components/WhatsAppButton';
import StarburstButton from './components/StarburstButton';

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
  icons: {
    icon: '/logo-marca.svg',
    shortcut: '/logo-marca.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`} style={{ fontFeatureSettings: '"cv11" 1' }}>
      <head>
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1019528647699315');
          fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src="https://www.facebook.com/tr?id=1019528647699315&ev=PageView&noscript=1" />
        </noscript>
      </head>
      <body>
        <main>{children}</main>
        <WhatsAppButton />
        <StarburstButton />
      </body>
    </html>
  );
}
