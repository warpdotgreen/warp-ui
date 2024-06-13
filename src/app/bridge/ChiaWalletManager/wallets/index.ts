import * as goby from './goby'
import { addCATParams, createOfferParams } from './types'
import * as ChiaWalletConnect from './walletconnect'

export interface WalletConfig {
  id: string
  name: string
  icon: string
  connect: (isPersistenceConnect: boolean, setWalletConnectUri: (uri: string) => void, sessionDisconnectCallback: () => Promise<void>) => Promise<string>
  disconnect: () => Promise<void>
  createOffer: (params: createOfferParams) => Promise<string>
  addCAT: (params: addCATParams) => Promise<void>
}

export const walletConfigs: WalletConfig[] = [
  {
    id: 'goby',
    name: 'Goby',
    icon: '/icons/Goby-symbol.svg',
    connect: goby.connect,
    disconnect: goby.disconnect,
    createOffer: (params) => goby.createOffer(params),
    addCAT: (params) => goby.addCAT(params)
  },
  {
    id: 'chiawalletconnect',
    name: 'Wallet Connect',
    icon: '/icons/Walletconnect-icon-gradient.png',
    connect: (isPersistenceConnect, setWalletConnectUri, sessionDisconnectCallback) => ChiaWalletConnect.connect(isPersistenceConnect, setWalletConnectUri, sessionDisconnectCallback),
    disconnect: ChiaWalletConnect.disconnect,
    createOffer: (params) => ChiaWalletConnect.createOffer(params),
    addCAT: (params) => ChiaWalletConnect.addCAT(params)
  },
  // Add new wallets here as they are implemented
]
