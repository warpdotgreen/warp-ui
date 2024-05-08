"use client"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount } from 'wagmi'

export default function EthereumWalletButton() {
  const { open } = useWeb3Modal()
  const { walletInfo } = useWalletInfo()
  const account = useAccount()
  const isConnected = Boolean(walletInfo?.name)
  return (
    <Button onClick={() => open()} variant="outline" className={cn("text-base gap-2 hidden sm:flex", !isConnected && 'shadow-sm shadow-green-300 grayscale')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {(isConnected && !!walletInfo?.icon) && <img className='group-hover:opacity-80 h-6 shadow-sm shadow-white/50 border rounded-full aspect-square bg-accent p-1 object-contain w-auto' src={walletInfo.icon} alt="ETH Connected Wallet Icon" />}
      {isConnected ? !!account.address ? `${account.address.slice(0, 5)}...${account.address.slice(-3)}` : 'Manage Wallet' : 'Connect ETH Wallet'}
    </Button>
  )
}
