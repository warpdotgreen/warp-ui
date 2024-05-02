import * as goby from './goby'
import * as Wallet2 from './wallet2'

export interface WalletConfig {
  id: string
  name: string
  connect: () => Promise<string>
  disconnect: () => void
}

export const walletConfigs: WalletConfig[] = [
  {
    id: 'goby',
    name: 'Goby',
    connect: goby.connect,
    disconnect: goby.disconnect,
  },
  {
    id: 'wallet2',
    name: 'Wallet 2',
    connect: Wallet2.connect,
    disconnect: Wallet2.disconnect,
  },
  // Add new wallets here as they are implemented
]
