import { WALLETCONNECT_PROJECT_ID, WcMetadata } from '../../config'
import SignClient from '@walletconnect/sign-client'
import { SessionTypes } from '@walletconnect/types'

const chain = process.env.NEXT_PUBLIC_TESTNET ? 'chia:testnet' : 'chia:mainnet'

// Wallet 1 specific logic
export async function connect(ispersistenceConnect: boolean, setWalletConnectUri: (uri: string) => void): Promise<string> {
  await getSession(ispersistenceConnect, setWalletConnectUri)
  const res = await getAddress() as { data?: string }
  const address = res?.data
  if (!address) throw new Error('Failed to get Chia wallet address [WalletConnect]')
  return address
}

export function disconnect(): void {
  console.log("Disconnecting Wallet 2...")
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