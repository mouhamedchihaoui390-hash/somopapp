import './globals.css';
import type { Metadata } from 'next';
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

const display = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'AutoParts ERP — Gestion de pièces automobiles',
  description: 'Système ERP professionnel de gestion de pièces détachées automobiles',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 p-4 md:p-6 bg-background">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
