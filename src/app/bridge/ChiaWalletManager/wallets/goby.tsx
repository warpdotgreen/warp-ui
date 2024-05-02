import * as GreenWeb from 'greenwebjs'
import { CHIA_NETWORK } from '../../config'

// Wallet 1 specific logic
export async function connect(): Promise<string> {
  await window.chia.request({ method: "connect" })
  const puzzle_hash = window.chia.selectedAddress
  const address = GreenWeb.util.address.puzzleHashToAddress(puzzle_hash, CHIA_NETWORK.prefix)
  return address
}

export function disconnect(): void {
  console.log("Disconnecting Wallet 1...")
}
