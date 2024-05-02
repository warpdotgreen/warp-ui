"use client"
import React from 'react'
import { useWallet } from './ChiaWalletManager/WalletContext'
import { walletConfigs } from './ChiaWalletManager/wallets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ChiaWalletModal: React.FC = () => {
  const { connectWallet, disconnectWallet, walletConnected, address } = useWallet()

  return (
    <div className='text-white'>

      <div className='flex gap-2'>
        {walletConfigs.map(wallet => (
          <Button key={wallet.id} disabled={wallet.id === walletConnected} className={cn('min-w-44', wallet.id === walletConnected && 'bg-green-800')} onClick={() => connectWallet(wallet.id)}>
            {wallet.id === walletConnected ? `${address?.slice(0, 5)}...${address?.slice(-5)}` : `Connect To ${wallet.name}`}
          </Button>
        ))}
        <Button onClick={disconnectWallet} disabled={!walletConnected}>Disconnect</Button>
      </div>
    </div>
  )
}

export default ChiaWalletModal
