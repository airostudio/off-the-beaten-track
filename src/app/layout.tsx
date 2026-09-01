import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Off the Beaten Track — Better fares. Earlier.',
  description:
    'Members see our newest flight discoveries, price drops and exclusive savings first. Compare flights and unlock member-only fares.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-navy-950 antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
