import type { Metadata } from "next";
import { satoshi } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Modern Ecommerce",
  description: "Trang thương mại điện tử thời trang hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${satoshi.variable} font-sans antialiased min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
