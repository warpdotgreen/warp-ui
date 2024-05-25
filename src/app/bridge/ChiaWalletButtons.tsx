"use client"
import React, { useState } from 'react'
import { useWallet } from './ChiaWalletManager/WalletContext'
import { walletConfigs } from './ChiaWalletManager/wallets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Loader, LogOut } from 'lucide-react'
import QRCode from "react-qr-code"
import CopyButton from '@/components/CopyButton'

const ChiaWalletButtons: React.FC = () => {
  const { connectWallet, disconnectWallet, walletConnected, walletConnectUri, setWalletConnectUri } = useWallet()
  const [loadingWalletId, setLoadingWalletId] = useState<string>('')

  const connectWithLoading = async (walletId: string) => {
    setLoadingWalletId(walletId)
    try {
      await connectWallet(walletId)
    } finally {
      setLoadingWalletId('')
    }
  }

  const onClose = () => {
    setWalletConnectUri(null)
    setLoadingWalletId('')
  }

  if (walletConnectUri) {
    return (
      <div className='h-auto mx-auto w-full max-w-full flex flex-col gap-6'>
        <div className='p-4 bg-white rounded-md'>
          <QRCode
            size={256}
            className='h-auto max-w-full w-full border-accent border-2 rounded-lg p-2 animate-in fade-in slide-in-from-bottom-2 duration-500'
            value={walletConnectUri}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <Button variant="ghost" className='flex gap-1 border-accent' onClick={onClose}>Cancel</Button>
          <CopyButton copyText={walletConnectUri}>Copy Link</CopyButton>
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500'>
      {walletConfigs.map(wallet => (
        <div key={wallet.id} className='relative flex flex-col h-24 w-full'>
          <Button
            variant="outline"
            disabled={wallet.id === walletConnected || loadingWalletId === wallet.id}
            className='group w-full h-full disabled:opacity-80 disabled:bg-accent flex justify-between select-none'
            onClick={() => connectWithLoading(wallet.id)}
          >
            <div className='p-4 pl-2 flex flex-col justify-center items-start'>
              <p className='text-xl font-extralight'>{wallet.name}</p>
              <p className={cn('text-sm font-mono font-extralight text-theme-green-foreground hidden', wallet.id === walletConnected && 'flex')}>Connected</p>
            </div>
            <Image className='group-hover:opacity-80 h-14 grayscale shadow-sm shadow-green-300 border rounded-full aspect-square bg-accent p-2 object-contain w-auto' src={wallet.icon} width={400} height={400} alt={`${wallet.name} wallet icon`} priority />
          </Button>
          <Loader className={cn('animate-spin absolute top-2 left-2 w-3.5 h-auto hidden', loadingWalletId === wallet.id && 'block')} />
        </div>
      ))}
      {walletConnected && <Button variant="ghost" className='w-fit ml-auto flex gap-2' onClick={disconnectWallet} disabled={!walletConnected}>Disconnect <LogOut className='w-4 h-auto' /></Button>}
    </div>
  )
}

export default ChiaWalletButtons
