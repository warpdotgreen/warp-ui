import { TESTNET, TOKENS, WALLETCONNECT_PROJECT_ID_XCH, xchWcMetadata } from '../../config'
import SignClient from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'
import { addCATParams, createOfferParams } from './types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CustomWalletConnectStorage } from './walletconnect'

const chain = TESTNET ? 'chia:testnet' : 'chia:mainnet'

// Wallet 1 specific logic
export async function connect(ispersistenceConnect: boolean, setWalletConnectUri: (uri: string) => void, sessionDisconnectCallback: () => Promise<void>): Promise<string> {
  await getSession(ispersistenceConnect, setWalletConnectUri, false, sessionDisconnectCallback)
  const address = await getAddress()
  if (!address) throw new Error('Failed to get Sage wallet address [WalletConnect]')
  return address
}

export async function disconnect(): Promise<void> {
  console.log('disconnect called')
  await disconnectSage()
}

export async function createOffer(params: createOfferParams): Promise<string> {
  const offer = await createOfferSage({
    ...params,
    fee: 2500000000,
  })
  return offer
}

export async function addCAT(params: addCATParams): Promise<void> {
  // assets automatically added which is so cool :)
  return Promise.resolve()
}

/*
 *
 * WalletConnect Functions
 * 
*/

async function reset(signClient: SignClient) {
  const sessions = signClient.session.getAll()
  sessions.forEach(session => {
    signClient.disconnect({ topic: session.topic, reason: { code: 400, message: "Resetting WC connections" } })
  })
}

const signClient = SignClient.init({
  projectId: WALLETCONNECT_PROJECT_ID_XCH,
  metadata: xchWcMetadata,
  storage: new CustomWalletConnectStorage("sage-wc-data")
})

async function getClient() {
  return await signClient
}


async function getSession(ispersistenceConnect?: boolean, setWalletConnectUri?: (uri: string) => void, disconnect?: boolean, sessionDisconnectCallback?: () => Promise<void>) {
  const signClient = await getClient()

  if(!disconnect && sessionDisconnectCallback) {
    signClient.on('session_delete', async () => {
      console.log('Session disconnected');
      if(sessionDisconnectCallback) {
        await sessionDisconnectCallback();
      }
    });
  }

  // If previous session exists, use it instead of initialising a new pairing
  const lastKeyIndex = signClient.session.getAll().length - 1
  const lastSession = signClient.session.getAll()[lastKeyIndex]
  if (lastSession) {
    await signClient.ping({ topic: lastSession.topic })
    console.log("*** SESSION FOUND & RESTORED ***")
    return lastSession
  }

  if(disconnect) {
    return;
  }

  if (ispersistenceConnect) throw new Error('Sage WalletConnect connection failed to re-establish.')
  
  try {
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: {
        chia: {
          methods: [
            'chia_createOffer',
            'chia_getAddress'
          ],
          chains: [chain],
          events: []
        }
      }
    })

    // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
    if (uri) {
      if (setWalletConnectUri) {
        setWalletConnectUri(uri)
      }
      const session = await approval()
      console.log("*** SESSION CREATED ***")
      return session
    }
  } catch (e) {
    console.error(e)
    throw new Error('Failed to connect to Wallet Connect')
  }

}


async function getAddress() {
  const signClient = await getClient()
  const session = await getSession()
  if (!signClient || !session) throw new Error('Get Chia Address Request Failed')
  try {
    const result = await signClient.request({
      topic: session.topic,
      chainId: chain,
      request: {
        method: 'chia_getAddress',
        params: {}
      }
    })
    return (result as any).address
  } catch (error: any) {
    console.log({ msg: "error in get address func", error })
    if (error?.message === "Invalid Request") {
      await reset(signClient)
    } else {
      throw new Error(error)
    }
  }
}

async function disconnectSage() {
  try {
    const signClient = await getClient()
    const session = await getSession(true, () => {}, true)
    if (!signClient || !session) throw new Error('Get Sage Sign Client/Session Request Failed')
    await signClient.disconnect({
      topic: session.topic,
      reason: {
        code: 6000,
        message: "USER_DISCONNECTED"
      }
    })
  } catch(_) {
    console.log(_);
  } finally {
    console.log('Clearing local storage...')
    localStorage.clear()
  }
}

async function createOfferSage(params: createOfferParams) {
  const signClient = await getClient()
  const session = await getSession()
  if (!signClient || !session) throw new Error('Failed to create offer with WC')

  const resultOffer: any = await signClient.request({
    topic: session.topic,
    chainId: chain,
    request: {
      method: "chia_createOffer",
      params,
    },
  })

  if (resultOffer.offer) return resultOffer.offer
  if (resultOffer.data?.offer) return resultOffer.data?.offer
  throw new Error('Failed to create offer')
}
