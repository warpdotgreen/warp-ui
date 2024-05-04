"use client"
import React from 'react'
import { useWallet } from './ChiaWalletManager/WalletContext'
import { walletConfigs } from './ChiaWalletManager/wallets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const ChiaWalletButtons: React.FC = () => {
  const { connectWallet, disconnectWallet, walletConnected, address } = useWallet()

  return (
    <div className='text-white'>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
        {walletConfigs.map(wallet => (
          <div key={wallet.id} className='relative flex flex-col flex-1 h-36 max-h-36 aspect-square w-full'>
            <Button
              disabled={wallet.id === walletConnected}
              className={cn('group w-full h-full disabled:opacity-100 disabled:bg-green-100 select-none', wallet.id === walletConnected && 'rounded-b-none')}
              onClick={() => connectWallet(wallet.id)}
            >
              <Image className='group-hover:opacity-80 max-h-24 h-full aspect-auto w-auto' src={wallet.icon} width={400} height={400} alt={`${wallet.name} wallet icon`} priority />
            </Button>
            <p className={cn('transition-all rounded-b-md px-1 py-1.5 text-xs font-medium select-none uppercase text-center w-full', wallet.id === walletConnected && 'bg-green-800')}>{wallet.id === walletConnected ? 'Connected' : wallet.name}</p>
          </div>
        ))}
        {/* <Button onClick={disconnectWallet} disabled={!walletConnected}>Disconnect</Button> */}
      </div>
    </div>
  )
}

export default ChiaWalletButtons
