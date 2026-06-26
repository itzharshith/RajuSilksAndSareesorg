import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Raju Silks & Sarees — Ethnic Master Weavers Store',
  description: 'Shop premium handloomed silk sarees, Kanjeevaram, Banarasi, and ethnic wear. Authentic luxury silk collection with 26+ categories.',
  keywords: ['silk sarees', 'Kanjeevaram', 'Banarasi', 'Indian sarees', 'ethnic wear', 'handloom'],
};

const LOGO_URL =
  'https://res.cloudinary.com/dbdzceo6f/image/upload/v1782464841/Gemini_Generated_Image_4r4oq14r4oq14r4o_2_cefvos.png';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        {/* Global watermark logo — fixed behind all content on every page */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden"
        >
          <img
            src={LOGO_URL}
            alt=""
            className="w-[min(70vw,600px)] h-auto object-contain select-none"
            style={{
              opacity: 0.045,
              filter: 'grayscale(30%) sepia(20%)',
              mixBlendMode: 'multiply',
            }}
            draggable={false}
          />
        </div>

        <AuthProvider>
          <CartProvider>
            {/* Stacking context above the watermark */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pb-16 lg:pb-0">{children}</main>
              <MobileTabBar />
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
