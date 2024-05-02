import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "warp.green",
  description: "warp.green is a cross-chain messaging protocol that currently supports sending messages between Chia, Ethereum, and Base.",
}

export default function UILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>warp.green</title>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
