import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Shopify Price Updater',
  description: 'Update Shopify prices from a CSV file',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-muted/50">
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-6">{children}</main>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
