import * as goby from './goby'
import * as ChiaWalletConnect from './walletconnect'

export interface WalletConfig {
  id: string
  name: string
  icon: string
  connect: (isPersistenceConnect: boolean) => Promise<string>
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
    id: 'chiawalletconnect',
    name: 'Wallet Connect',
    icon: '/icons/Walletconnect-icon-gradient.png',
    connect: (isPersistenceConnect: boolean) => ChiaWalletConnect.connect(isPersistenceConnect),
    disconnect: ChiaWalletConnect.disconnect,
  },
  // Add new wallets here as they are implemented
]
