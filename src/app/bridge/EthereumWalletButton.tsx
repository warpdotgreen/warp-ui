"use client"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWalletInfo, useWeb3Modal } from '@web3modal/wagmi/react'
import Image from 'next/image'

export default function EthereumWalletButton() {
  const { open } = useWeb3Modal()
  const { walletInfo } = useWalletInfo()
  const isConnected = Boolean(walletInfo?.name)
  return (
    <div className='grid grid-cols-2 gap-2'>
      <div className='relative flex flex-col flex-1 h-36 max-h-36 aspect-square w-full'>
        <Button variant="theme" className={cn('group w-full h-full disabled:opacity-100 disabled:bg-theme-green select-none', isConnected && 'rounded-b-none')} onClick={() => open()}>
          <Image className='group-hover:opacity-80 max-h-16 h-full aspect-auto w-auto' src="/icons/Walletconnect-icon.svg" width={400} height={400} alt={`Wallet connect icon`} priority />
        </Button>
        <p className={cn('rounded-b-md px-1 py-1.5 text-xs font-medium select-none uppercase text-center w-full', isConnected && 'bg-theme-green-foreground text-secondary font-semibold')}>{isConnected ? 'Connected' : ''}</p>
      </div>
    </div>
  )
}
