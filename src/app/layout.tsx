import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumora - Watch Movies & TV Shows",
  description: "Premium streaming platform for the best movies and TV shows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
