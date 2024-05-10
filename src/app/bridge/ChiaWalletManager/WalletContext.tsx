"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { walletConfigs } from './wallets'
import { toast } from "sonner"


interface WalletContextType {
  address: string | null
  walletConnected: string | null
  walletConnectUri: string | null
  connectWallet: (walletId: string, isPersistenceConnect?: boolean) => Promise<void>
  disconnectWallet: () => void
  setWalletConnectUri: (uri: string | null) => void
}

const defaultContext: WalletContextType = {
  address: null,
  walletConnected: null,
  walletConnectUri: null,
  connectWallet: async () => { console.warn("connectWallet function called without a WalletProvider") },
  disconnectWallet: () => { console.warn("disconnectWallet function called without a WalletProvider") },
  setWalletConnectUri: () => { console.warn("setWalletConnectUri function called without a WalletConnectProvider") }
}

const WalletContext = createContext<WalletContextType>(defaultContext)

export const ChiaWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [address, setAddress] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState<string | null>(null)
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null)

  const connectWallet = useCallback(async (walletId: string, isPersistenceConnect?: boolean) => {
    const wallet = walletConfigs.find(w => w.id === walletId)
    if (wallet) {
      const addr = await wallet.connect(Boolean(isPersistenceConnect), setWalletConnectUri)
      setWalletConnectUri(null)
      setAddress(addr)
      setWalletConnected(wallet.id)
      localStorage.setItem('walletConnected', wallet.id)  // Save connected wallet ID
      localStorage.setItem('walletAddress', addr)
      if (!isPersistenceConnect) {
        toast.success('Connected Wallet', { id: "connect-wallet", duration: 2000 })
      }
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setWalletConnected(null)
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }, [])

  // Attempt to reconnect to the wallet on initialization
  useEffect(() => {
    const savedWalletId = localStorage.getItem('walletConnected')
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedWalletId && savedAddress) {
      setAddress(savedAddress)  // Set the address from localStorage
      setWalletConnected(savedWalletId)  // Set the wallet type from localStorage
      connectWallet(savedWalletId, true).catch(() => {
        toast.error('Disconnected Wallet', { id: "disconnect-wallet" })
        // If reconnection fails, clear the local storage
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletAddress')
        setAddress(null)
        setWalletConnected(null)
      })
    }
  }, [connectWallet])

  return (
    <WalletContext.Provider value={{ address, connectWallet, disconnectWallet, walletConnected, walletConnectUri, setWalletConnectUri }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  return context
}
