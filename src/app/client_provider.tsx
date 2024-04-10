"use client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 
import { wagmiConfig, WALLETCONNECT_PROJECT_ID } from "./config";
import { createWeb3Modal } from "@web3modal/wagmi";
import { ChiaWalletContext } from "./chia_wallet_context";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer;
    }
  }, []);

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
