import * as GreenWeb from 'greenwebjs'
import { CHIA_NETWORK } from '../../config'
import { createOfferParams } from './types'

// Wallet 1 specific logic
export async function connect(): Promise<string> {
  await window.chia.request({ method: "connect" })
  const puzzle_hash = window.chia.selectedAddress
  const address = GreenWeb.util.address.puzzleHashToAddress(puzzle_hash, CHIA_NETWORK.prefix)
  return address
}

export async function disconnect(): Promise<void> {
  // Currently not possible to disconnect from Goby wallet
  return Promise.resolve()
}

export async function createOffer(params: createOfferParams): Promise<string> {
  const response = await window.chia.request({ method: 'createOffer', params })
  if (response?.offer) {
    return response.offer
  }
  else throw new Error('Failed to create offer')
}
