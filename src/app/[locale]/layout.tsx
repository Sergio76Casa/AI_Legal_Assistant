import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChatProvider } from "@/context/ChatContext"; // Import Context
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal & Halal Assistant",
  description: "AI assistance for bureaucracy and culture in Spain.",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['es', 'en', 'fr', 'ar', 'zh'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        suppressHydrationWarning={true}
        className={`${playfair.variable} ${inter.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ChatProvider>
            {children}
            <CookieBanner />
            <Analytics />
          </ChatProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
