import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Cornelia James Price Engine',
  description: 'Visualise and update CJ prices & COGs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-muted/50">
        <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center p-6">{children}</main>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
