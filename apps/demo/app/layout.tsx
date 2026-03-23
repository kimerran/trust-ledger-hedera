import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

export const metadata: Metadata = {
  title: 'TrustLedger Demo',
  description: 'Interactive walkthrough of the AI decision audit trail pipeline',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <nav className="border-b border-[#B2DFDB] bg-white">
          <div className="container flex h-14 items-center px-4">
            <span className="text-lg font-bold tracking-tight text-[#0D5752]">
              TrustLedger
            </span>
            <span className="ml-2 bg-[#E0F2F1] text-[#0D5752] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>
        </nav>
        <main className="container mx-auto max-w-4xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
