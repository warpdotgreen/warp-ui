"use client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from 'date-fns'
import { NETWORKS, WATCHER_API_ROOT } from "../../bridge/config"
import { cn, getChainIcon } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyableLongHexString } from "@/components/CopyableHexString"
import { ChevronRight } from "lucide-react"


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
    queryFn: () => fetch(`${WATCHER_API_ROOT}latest-messages?limit=${NUM_OF_MESSAGES}`).then(res => res.json()),
    refetchInterval: 10000
  })

  const formatMessage = (m: MessageResponse, i: number) => {
    const timestamp = m.destination_timestamp ?? m.source_timestamp
    const typeDisplayName = typeToDisplayName.get(m.parsed.type) || 'Unknown App'
    const sourceChainDisplayName = NETWORKS.find(n => n.id === m.source_chain)!.displayName
    const destChainDisplayName = NETWORKS.find(n => n.id === m.destination_chain)!.displayName
    const timeSince = formatDistanceToNow(timestamp * 1000, { addSuffix: true }).replace('about ', '')
    const sourceChainIcon = <div className="bg-background p-0.5 rounded-full">{getChainIcon(sourceChainDisplayName, 'w-5 mt-0.5')}</div>
    const destChainIcon = <div className="bg-background p-0.5 rounded-full">{getChainIcon(destChainDisplayName, 'w-5 mt-0.5')}</div>

    return (
      <div key={m.id} className={cn("rounded-md w-full p-6 bg-background z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-2", i + 1 > 3 && 'hidden md:flex')}>
        <div className="flex gap-4 justify-between items-center">
          <CopyableLongHexString hexString={`0x${m.nonce}`} className="bg-transparent p-0 text-xl text-primary opacity-100" tooltipText="Copy Message Nonce" />
          <div className="flex gap-1 py-2">
            {sourceChainIcon}
            <ArrowRight />
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

function ArrowRight() {
  return (
    <svg className="opacity-80 w-4 h-auto" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}
