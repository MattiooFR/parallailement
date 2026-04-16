import type { Metadata } from "next";
import { Inter, Fraunces, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parallailement — Club de parapente, vallée d'Aure",
  description:
    "Club de vol libre parapente basé à Ilhet (65), vallée d'Aure, Hautes-Pyrénées.",
  openGraph: {
    title: "Parallailement — Club de parapente, vallée d'Aure",
    description:
      "Club de vol libre parapente basé à Ilhet (65), vallée d'Aure, Hautes-Pyrénées.",
    siteName: "Parallailement",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parallailement — Club de parapente, vallée d'Aure",
    description:
      "Club de vol libre parapente basé à Ilhet (65), vallée d'Aure, Hautes-Pyrénées.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fraunces.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
