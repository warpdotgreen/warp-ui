import { createPublicClient, http, type Hash } from "viem"

export async function findRecentOutgoingTx(
  fromAddress: `0x${string}`,
  targetContract: `0x${string}`,
  rpcUrl: string,
  sinceTimestampMs: number,
  lookbackBlocks = 100,
): Promise<Hash | null> {
  const client = createPublicClient({ transport: http(rpcUrl) })
  const latestBlock = await client.getBlockNumber()
  const sinceTimestampSec = Math.floor(sinceTimestampMs / 1000)
  const fromLower = fromAddress.toLowerCase()
  const targetLower = targetContract.toLowerCase()

  for (let i = BigInt(0); i < BigInt(lookbackBlocks); i++) {
    const blockNumber = latestBlock - i
    if (blockNumber < BigInt(0)) break

    const block = await client.getBlock({
      blockNumber,
      includeTransactions: true,
    })

    if (Number(block.timestamp) < sinceTimestampSec - 120) break

    for (const tx of block.transactions) {
      if (typeof tx === "string") continue
      if (
        tx.from.toLowerCase() === fromLower &&
        tx.to?.toLowerCase() === targetLower
      ) {
        return tx.hash
      }
    }
  }

  return null
}
