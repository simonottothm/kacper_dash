import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kacper Dashboard",
  description: "Lead Dashboard SaaS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="de" className={`w-full ${inter.variable}`}>
      <body className="w-full">
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


