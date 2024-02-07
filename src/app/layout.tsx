import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CreateBuffer from "./create_buffer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bridge UI",
  description: "Chia <-> Ethereum Bridge UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className}>
        <CreateBuffer>
          {children}
        </CreateBuffer>
      </body>
    </html>
  );
}
