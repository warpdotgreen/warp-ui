"use client"
import { WagmiProvider } from "wagmi"
import { wagmiConfig, WALLETCONNECT_PROJECT_ID_ETH } from "./config"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { useEffect } from "react"
import { ChiaWalletProvider } from "./ChiaWalletManager/WalletContext"

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId: WALLETCONNECT_PROJECT_ID_ETH,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'var(--font-inter)',
    '--w3m-border-radius-master': '2px',
    '--w3m-accent': '#8064dd',
    '--w3m-color-mix': '#000',
    '--w3m-color-mix-strength': 35,
  }
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
      <ChiaWalletProvider>
        {children}
      </ChiaWalletProvider>
    </WagmiProvider>
  )
}
