"use client"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, WALLETCONNECT_PROJECT_ID } from "./config"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { useEffect, useState } from "react"
import { ChiaWalletProvider } from "./ChiaWalletManager/WalletContext"

const queryClient = new QueryClient()

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId: WALLETCONNECT_PROJECT_ID,
  enableOnramp: true,
  themeMode: 'dark',
})

export function ClientProvider({ children }: { children: React.ReactNode }) {

  // Required for GreenWeb
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer
    }
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChiaWalletProvider>
          {children}
        </ChiaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
