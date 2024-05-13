import { TOKENS, WALLETCONNECT_PROJECT_ID, WcMetadata } from '../../config'
import SignClient from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'
import { addCATParams, createOfferParams } from './types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const chain = process.env.NEXT_PUBLIC_TESTNET ? 'chia:testnet' : 'chia:mainnet'

// Wallet 1 specific logic
export async function connect(ispersistenceConnect: boolean, setWalletConnectUri: (uri: string) => void): Promise<string> {
  await getSession(ispersistenceConnect, setWalletConnectUri)
  const res = await getAddress() as { data?: string }
  const address = res?.data
  if (!address) throw new Error('Failed to get Chia wallet address [WalletConnect]')
  return address
}

export async function disconnect(): Promise<void> {
  await disconnectWC()
}

export async function createOffer(params: createOfferParams): Promise<string> {
  await createOfferWC(params)
  throw new Error('')
}

export async function addCAT(params: addCATParams): Promise<void> {
  await addAssetWC(params)
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

function getFingerprint(session: SessionTypes.Struct) {
  return session.namespaces.chia.accounts[0].split(':').pop()
}

async function getClient() {
  const signClient = await SignClient.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: WcMetadata
  })
  return signClient
}


async function getSession(ispersistenceConnect?: boolean, setWalletConnectUri?: (uri: string) => void) {
  const signClient = await getClient()
  // If previous session exists, use it instead of initialising a new pairing
  const lastKeyIndex = signClient.session.getAll().length - 1
  const lastSession = signClient.session.getAll()[lastKeyIndex]
  if (lastSession) {
    await signClient.ping({ topic: lastSession.topic })
    console.log("*** SESSION FOUND & RESTORED ***")
    return lastSession
  }

  if (ispersistenceConnect) throw new Error('Chia WalletConnect connection failed to re-establish.')

  try {
    const { uri, approval } = await signClient.connect({
      requiredNamespaces: {
        chia: {
          methods: [
            'chia_getCurrentAddress',
            'chia_createOfferForIds',
            'chia_getWallets',
            'chia_addCATToken'
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
  const fingerprint = getFingerprint(session)
  try {
    const result = await signClient.request({
      topic: session.topic,
      chainId: chain,
      request: {
        method: 'chia_getCurrentAddress',
        params: {
          fingerprint,
          wallet_id: 0,
          new_address: false,
        }
      }
    })
    return result
  } catch (error: any) {
    if (error?.message === "Invalid Request") {
      await reset(signClient)
    } else {
      throw new Error(error)
    }
  }
}

async function disconnectWC() {
  const signClient = await getClient()
  const session = await getSession()
  if (!signClient || !session) throw new Error('Get Chia Address Request Failed')
  const result = await signClient.disconnect({
    topic: session.topic,
    reason: {
      code: 6000,
      message: "USER_DISCONNECTED"
    }
  })
  return result
}

async function createOfferWC(params: createOfferParams) {
  const signClient = await getClient()
  const session = await getSession()
  if (!signClient || !session) throw new Error('Failed to create offer with WC')
  const fingerprint = getFingerprint(session)

  // Check that Chia wallet has all assets

  interface wallet {
    data: string
    id: number
    name: string
    type: 6
    meta: {
      assetId: string
      name: string
    }
  }

  interface wallets {
    data: wallet[]
    isError: boolean
    isSuccess: boolean
  }

  const request: Promise<wallets> = signClient.request({
    topic: session.topic,
    chainId: chain,
    request: {
      method: "chia_getWallets",
      params: {
        fingerprint,
        includeData: true
      },
    },
  })

  const { data } = await request

  const requiredAssetIDs = params.offerAssets.map(asset => asset.assetId).filter(i => i) // Filter out Chia from requiredAssets as wallets will have by default
  const walletAssetIDs = data.map(wallet => wallet.meta.assetId)
  const missingAssetIDs = requiredAssetIDs.filter(assetId => !walletAssetIDs.includes(assetId))

  if (missingAssetIDs.length) {

    toast.error("Missing Wallet Assets", {
      action: <Button variant="outline" className='ml-auto' asChild><Link href={`/bridge/assets?addAssets=${missingAssetIDs.join(',')}`} target="_blank">Add Asset</Link></Button>,
      id: 'add-missing-assets',
      duration: 40000,
      closeButton: true,
      important: true,
    })
    throw new Error('Missing wallet assets')
  }

  // If user has all assets in wallet, send offer request
  interface resultOffer {
    error?: {
      data: {
        error: string
        success: boolean
      }
    }
    data?: {
      offer: string
      success: boolean
    }
  }

  let offer: { [key: string]: number } = {}
  params.offerAssets.forEach(a => {
    if (a.assetId === "") {
      offer["1"] = -a.amount
      return
    }
    const matchedChiaWallet = data.find(wallet => wallet.meta.assetId === a.assetId)
    if (!matchedChiaWallet) throw new Error('Failed to create offer')
    offer[matchedChiaWallet.id.toString()] = a.amount
  })

  const resultOffer: resultOffer = await signClient.request({
    topic: session.topic,
    chainId: chain,
    request: {
      method: "chia_createOfferForIds",
      params: {
        fingerprint,
        offer,
        driverDict: {},
        disableJSONFormatting: true,
      },
    },
  })

}

async function addAssetWC(params: addCATParams) {
  const signClient = await getClient()
  const session = await getSession()
  if (!signClient || !session) throw new Error('Failed to create offer with WC')
  const fingerprint = getFingerprint(session)

  await signClient.request({
    topic: session.topic,
    chainId: chain,
    request: {
      method: "chia_addCATToken",
      params: {
        fingerprint,
        name: params.symbol,
        assetId: params.assetId
      },
    },
  })
}