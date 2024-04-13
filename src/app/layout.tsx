import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bridging Interface",
  description: "Interface for an EVM-Chia bridge powered by the warp.green cross-chain messaging protocol. Currently supported networks include Chia, Ethereum, and Base.",
};

export default function UILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>warp.green</title>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
