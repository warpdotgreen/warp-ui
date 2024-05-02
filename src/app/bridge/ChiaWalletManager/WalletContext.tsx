"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { walletConfigs } from './wallets'

interface WalletContextType {
  address: string | null
  walletConnected: string | null
  connectWallet: (walletId: string) => Promise<void>
  disconnectWallet: () => void
}

const defaultContext: WalletContextType = {
  address: null,
  walletConnected: null,
  connectWallet: async () => { console.warn("connectWallet function called without a WalletProvider") },
  disconnectWallet: () => { console.warn("disconnectWallet function called without a WalletProvider") }
}

const WalletContext = createContext<WalletContextType>(defaultContext)

export const ChiaWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [address, setAddress] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState<string | null>(null)

  const connectWallet = useCallback(async (walletId: string) => {
    const wallet = walletConfigs.find(w => w.id === walletId)
    if (wallet) {
      try {
        const addr = await wallet.connect()
        setAddress(addr)
        setWalletConnected(wallet.id)
        localStorage.setItem('walletConnected', wallet.id)  // Save connected wallet ID
        localStorage.setItem('walletAddress', addr)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
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
      connectWallet(savedWalletId).catch(() => {
        // If reconnection fails, clear the local storage
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletAddress')
        setAddress(null)
        setWalletConnected(null)
      })
    }
  }, [connectWallet])

  return (
    <WalletContext.Provider value={{ address, connectWallet, disconnectWallet, walletConnected }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  return context
}
