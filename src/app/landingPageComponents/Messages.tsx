"use client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from 'date-fns'
import { NETWORKS } from "../bridge/config"
import { cn, getChainIcon } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyableLongHexString } from "@/components/CopyableHexString"


interface MessageResponse {
  id: number
  nonce: string
  source_chain: string
  source: string
  destination_chain: string
  destination: string
  contents: string[]
  source_block_number: number
  source_timestamp: number
  source_transaction_hash: string
  destination_block_number: null | number
  destination_timestamp: null | number
  destination_transaction_hash: null | string
  status: string
  parsed: Parsed
}

interface Parsed {
  type: string
  contract: string
  asset_id: null | string
  token_symbol: string
  amount_mojo: number
  receiver: string
}

const typeToDisplayName = new Map([
  ["cat_bridge", "CAT Bridge"],
  ["erc20_bridge", "ERC-20 Bridge"],
])

const NUM_OF_MESSAGES = 6

function Messages() {
  const { data: messages, isLoading } = useQuery<MessageResponse[]>({
    queryKey: ['landingPage_latest-messages'],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_WATCHER_API_ROOT}latest-messages?limit=${NUM_OF_MESSAGES}`).then(res => res.json()),
    refetchInterval: 10000
  })

  const formatMessage = (m: MessageResponse, i: number) => {
    const timestamp = m.destination_timestamp ?? m.source_timestamp
    const typeDisplayName = typeToDisplayName.get(m.parsed.type) || 'Unknown Bridge'
    const sourceChainDisplayName = NETWORKS.find(n => n.id === m.source_chain)!.displayName
    const destChainDisplayName = NETWORKS.find(n => n.id === m.destination_chain)!.displayName
    const timeSince = formatDistanceToNow(timestamp * 1000, { addSuffix: true }).replace('about ', '')
    const sourceChainIcon = <div className="border bg-background p-0.5 rounded-full translate-x-4">{getChainIcon(sourceChainDisplayName, 'w-5')}</div>
    const destChainIcon = <div className="border z-10 bg-background p-0.5 rounded-full shadow">{getChainIcon(destChainDisplayName, 'w-5')}</div>

    return (
      <div key={m.id} className={cn("rounded-md w-full p-6 bg-background z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-2", i + 1 > 3 && 'hidden md:flex')}>
        <div className="flex gap-4 justify-between items-center">
          <CopyableLongHexString hexString={`0x${m.nonce}`} className="bg-transparent p-0 text-xl text-primary opacity-100" tooltipText="Copy Message Nonce" />
          <div className="flex gap-2 py-2">
            {sourceChainIcon}
            {destChainIcon}
          </div>
        </div>

        <div className="flex gap-4 justify-between items-center">
          <div className="flex flex-col gap-1 py-2 w-full opacity-80">
            <table>
              <tbody>
                <tr className="">
                  <td className="opacity-80">Time</td>
                  <td className="text-right">{m.destination_timestamp === null ? 'Sent' : 'Received'} {timeSince}</td>
                </tr>
                <tr>
                  <td className="opacity-80">App</td>
                  <td className="text-right">{typeDisplayName}</td>
                </tr>
                <tr>
                  <td className="opacity-80">Token</td>
                  <td className="text-right">{m.parsed.token_symbol}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !messages) {
    return <>{Array.from({ length: NUM_OF_MESSAGES }, (_, i) => <Skeleton key={i} className="w-full h-[192px] bg-accent animate-none" />)}</>
  }

  return <>{messages.map(formatMessage)}</>
}

export default Messages