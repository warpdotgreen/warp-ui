"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { walletConfigs } from './wallets'
import { toast } from "sonner"
import { addCATParams, createOfferParams } from './wallets/types'


interface WalletContextType {
  address: string | null
  walletConnected: string | null
  walletConnectUri: string | null
  connectWallet: (walletId: string, isPersistenceConnect?: boolean) => Promise<void>
  disconnectWallet: () => Promise<void>
  setWalletConnectUri: (uri: string | null) => void
  createOffer: (params: createOfferParams) => Promise<string | undefined>
  addCAT: (params: addCATParams) => Promise<void>
}

const defaultContext: WalletContextType = {
  address: null,
  walletConnected: null,
  walletConnectUri: null,
  connectWallet: async () => { console.warn("connectWallet function called without a WalletProvider") },
  disconnectWallet: async () => { console.warn("disconnectWallet function called without a WalletProvider") },
  setWalletConnectUri: () => { console.warn("setWalletConnectUri function called without a WalletConnectProvider") },
  createOffer: async () => { console.warn("createOffer function called without a WalletConnectProvider"); return Promise.resolve('') },
  addCAT: async () => { console.warn("addCAT function called without a WalletConnectProvider") },
}

const WalletContext = createContext<WalletContextType>(defaultContext)

export const ChiaWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [address, setAddress] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState<string | null>(null)
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null)

  const disconnectWallet = useCallback(async () => {
    const wallet = walletConfigs.find(w => w.id === walletConnected)
    if (wallet) {
      try {
        await wallet.disconnect()
        setAddress(null)
        setWalletConnected(null)
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletAddress')
        toast.success('Disconnected Wallet', { id: "disconnect-wallet" })
      } catch (error) {
        toast.error('Action Failed', { id: "action-failed" })
      }
    }
  }, [walletConnected])

  const connectWallet = useCallback(async (walletId: string, isPersistenceConnect?: boolean) => {
    const wallet = walletConfigs.find(w => w.id === walletId)
    if (wallet) {
      try {
        const addr = await wallet.connect(Boolean(isPersistenceConnect), setWalletConnectUri, async () => {
          await disconnectWallet()
        })
        setWalletConnectUri(null)
        setAddress(addr)
        setWalletConnected(wallet.id)
        localStorage.setItem('walletConnected', wallet.id)  // Save connected wallet ID
        localStorage.setItem('walletAddress', addr)
        if (!isPersistenceConnect) {
          toast.success('Connected Wallet', { id: "connect-wallet", duration: 2000 })
        }
      } catch(_) {
        if(!isPersistenceConnect) {
          toast.error('Failed to connect wallet', { id: "failed-to-connect-wallet" })
          console.error("Exception ocurred while connecting to wallet", _);
        }
      }
    }
  }, [disconnectWallet])

  const createOffer = useCallback(async (params: createOfferParams) => {
    const wallet = walletConfigs.find(w => w.id === walletConnected)
    if (wallet) {
      try {
        const offer = await wallet.createOffer(params)
        toast.success('Created Offer', { id: "created-offer" })
        return offer
      } catch (error) {
        toast.error('Failed to create offer', { duration: 20000, id: "failed-to-create-offer" })
        throw new Error('Failed to create offer')
      }
    }
  }, [walletConnected])

  const addCAT = useCallback(async (params: addCATParams) => {
    const wallet = walletConfigs.find(w => w.id === walletConnected)
    if (wallet) {
      try {
        await wallet.addCAT(params)
        toast.success(`Successfully added ${params.symbol} to your wallet`, { id: "added-cat-success" })
      } catch (error) {
        toast.error(`Failed to add ${params.symbol} to your wallet`, { id: "failed-to-add-cat" })
      }
    }
  }, [walletConnected])

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
    <WalletContext.Provider value={{ address, connectWallet, disconnectWallet, walletConnected, walletConnectUri, setWalletConnectUri, createOffer, addCAT }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  return context
}
