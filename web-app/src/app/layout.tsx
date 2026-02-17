import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Legal Assistant | Halal Compliance",
  description: "Asistencia legal y administrativa para la comunidad musulmana y expatriados en España.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
