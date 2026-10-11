import { Toaster } from "@/components/ui/sonner"
import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ReactQueryProvider from "@/components/ReactQueryProvider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "warp.green | A Cross-Chain Messaging Protocol",
  description: "warp.green is a cross-chain messaging protocol that currently supports sending messages between Chia, Ethereum, and Base.",
}

export default function UILayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark font-extralight">
      <body className={cn(inter.className, 'max-w-screen overflow-x-hidden')}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster
          expand
          toastOptions={{
            classNames: {
              toast: 'border-input bg-accent text-primary',
              title: 'font-extralight text-base'
            }
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
