import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export const metadata: Metadata = {
  title: 'Off the Beaten Track — Better fares. Earlier.',
  description:
    'Members see our newest flight discoveries, price drops and exclusive savings first. Compare flights and unlock member-only fares.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-16 font-sans text-navy-950 antialiased md:pb-0">
        <Header />
        {children}
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
