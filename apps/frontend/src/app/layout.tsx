import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from './QueryProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Syntheta - Synthetic Data Generation Platform",
  description: "Design, orchestrate, and monitor synthetic data generation pipelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
} 