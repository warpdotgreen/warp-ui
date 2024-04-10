"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 
import { wagmiConfig, WALLETCONNECT_PROJECT_ID } from "./config";
import { createWeb3Modal } from "@web3modal/wagmi";
import { ChiaWalletContext } from "./chia_wallet_context";
import { useState } from "react";

const queryClient = new QueryClient() 

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId: WALLETCONNECT_PROJECT_ID,
  enableOnramp: true,
  themeMode: 'dark',
})

export function ClientProvider({ children }: {
  children: React.ReactNode
}) {
  const [chiaWalletContext, setChiaWalletContext] = useState({
    connected: false,
    address: "",
    setChiaWalletContext: (_: any) => {},
  });
  chiaWalletContext.setChiaWalletContext = setChiaWalletContext;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChiaWalletContext.Provider value={chiaWalletContext}>
          {children}
        </ChiaWalletContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
