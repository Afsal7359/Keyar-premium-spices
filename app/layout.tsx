import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Keyaar Premium Spices – Single-Origin Whole Spices, Graded & Sealed',
  description:
    'Single-origin green cardamom, Tellicherry black pepper, Zanzibar clove, and whole nutmeg flower. Graded by hand, hermetically sealed fresh, and packed from 50 g to 1 kg by Keyaar Premium Spices.',
  keywords: [
    'keyaar premium spices',
    'single origin spices',
    'green cardamom',
    'tellicherry black pepper',
    'whole cloves',
    'nutmeg flower',
    'mace blades',
    'kerala spices',
    'keyaar spices',
  ],
  authors: [{ name: 'Keyaar Premium Spices' }],
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main style={{ minHeight: '80vh', paddingTop: '80px' }}>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
