import * as goby from './goby'
import * as Wallet2 from './wallet2'

export interface WalletConfig {
  id: string
  name: string
  icon: string
  connect: () => Promise<string>
  disconnect: () => void
}

export const walletConfigs: WalletConfig[] = [
  {
    id: 'goby',
    name: 'Goby',
    icon: '/icons/Goby-symbol.svg',
    connect: goby.connect,
    disconnect: goby.disconnect,
  },
  {
    id: 'wallet2',
    name: 'Wallet 2',
    icon: '/icons/Walletconnect-icon-gradient.png',
    connect: Wallet2.connect,
    disconnect: Wallet2.disconnect,
  },
  // Add new wallets here as they are implemented
]
