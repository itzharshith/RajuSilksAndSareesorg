import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import Background from '@/components/Background';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Raju Silks & Sarees — Ethnic Master Weavers Store',
  description: 'Shop premium handloomed silk sarees, Kanjeevaram, Banarasi, and ethnic wear. Authentic luxury silk collection with 26+ categories.',
  keywords: ['silk sarees', 'Kanjeevaram', 'Banarasi', 'Indian sarees', 'ethnic wear', 'handloom'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        {/* Single globally-mounted background — renders once, covers all pages */}
        <Background />

        <AuthProvider>
          <CartProvider>
            {/* z-10 stacking context sits above the z-0 background */}
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
