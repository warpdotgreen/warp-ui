"use client"
import React from 'react'
import { useWallet } from './ChiaWalletManager/WalletContext'
import { walletConfigs } from './ChiaWalletManager/wallets'

const ChiaWalletModal: React.FC = () => {
  const { connectWallet, disconnectWallet, walletConnected, address } = useWallet()

  return (
    <div className='text-white'>
      <h2>Connect to a Wallet</h2>
      <p>Address: {address}</p>
      {walletConfigs.map(wallet => (
        <button className='border m-2' key={wallet.id} onClick={() => connectWallet(wallet.id)}>
          Connect {wallet.name}
        </button>
      ))}
      <button onClick={disconnectWallet} disabled={!walletConnected}>Disconnect</button>
      {walletConnected ? <p className='text-red-600 font-medium'>Connected to: {walletConnected}</p> : <p>No wallet connected</p>}
    </div>
  )
}

export default ChiaWalletModal
