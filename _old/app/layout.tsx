import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import Sidebar from '../components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'MovieDB',
  description: 'Discover and track movies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <Providers>
          <Sidebar />
          <main className="container mx-auto p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}