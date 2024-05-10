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
        <QRCode
          size={256}
          className='h-auto max-w-full w-full border-accent border-2 rounded-lg p-2 animate-in fade-in slide-in-from-bottom-2 duration-500'
          value={walletConnectUri}
          viewBox={`0 0 256 256`}
        />
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
        <div key={wallet.id} className='relative flex flex-col h-36 max-h-36 w-full'>
          <Button
            variant="outline"
            disabled={wallet.id === walletConnected || loadingWalletId === wallet.id}
            className='group w-full h-full disabled:opacity-80 disabled:bg-accent flex justify-between select-none'
            onClick={() => connectWithLoading(wallet.id)}
          >
            <div className='p-4 flex items-center gap-4'>
              <p className='text-2xl sm:text-3xl font-extralight'>{wallet.name}</p>
            </div>
            <Image className='group-hover:opacity-80 h-16 grayscale shadow-sm shadow-green-300 border rounded-full aspect-square bg-accent p-2 object-contain w-auto' src={wallet.icon} width={400} height={400} alt={`${wallet.name} wallet icon`} priority />
          </Button>
          <Loader className={cn('animate-spin absolute top-[18px] left-[14px] hidden w-4 h-4', loadingWalletId === wallet.id && 'block')} />
          <div className={cn('absolute top-4 left-4 gap-2 items-center hidden select-none', wallet.id === walletConnected && 'flex')}>
            <span aria-hidden className={'w-2 h-2 rounded-full overflow-visible bg-theme-green-foreground'}></span>
            <p className='text-sm font-mono font-extralight text-theme-green-foreground'>Connected</p>
          </div>
        </div>
      ))}
      {walletConnected && <Button variant="ghost" className='w-fit ml-auto flex gap-2' onClick={disconnectWallet} disabled={!walletConnected}>Disconnect <LogOut className='w-4 h-auto' /></Button>}
    </div>
  )
}

export default ChiaWalletButtons
