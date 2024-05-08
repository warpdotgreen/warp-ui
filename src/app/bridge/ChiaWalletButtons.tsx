"use client"
import React, { useState } from 'react'
import { useWallet } from './ChiaWalletManager/WalletContext'
import { walletConfigs } from './ChiaWalletManager/wallets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Loader, LogOut } from 'lucide-react'

const ChiaWalletButtons: React.FC = () => {
  const { connectWallet, disconnectWallet, walletConnected } = useWallet()
  const [loadingWalletId, setLoadingWalletId] = useState<string>('')

  const connectWithLoading = async (walletId: string) => {
    setLoadingWalletId(walletId)
    try {
      await connectWallet(walletId)
    } finally {
      setLoadingWalletId('')
    }
  }

  return (
    <div className='grid gap-2'>
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
