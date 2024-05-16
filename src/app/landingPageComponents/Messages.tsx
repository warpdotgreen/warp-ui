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

const NUM_OF_MESSAGES = 12

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
    const sourceChainIcon = <div className="bg-background p-0.5 rounded-full">{getChainIcon(sourceChainDisplayName, 'w-5 mt-0.5')}</div>
    const destChainIcon = <div className="bg-background p-0.5 rounded-full">{getChainIcon(destChainDisplayName, 'w-5 mt-0.5')}</div>

    return (
      <div key={m.id} className={cn("rounded-md mb-2 w-full py-[18px] px-4 bg-accent/50 hover:bg-accent/90 transition-colors border z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-0", i + 1 > 4 && 'hidden 2xl:flex')}>
        <div className="flex gap-4 justify-between items-center">
          <CopyableLongHexString hexString={`0x${m.nonce}`} className="p-0 text-base sm:text-md font-extralight opacity-80 px-4 rounded-[8px] border text-primary" tooltipText="Copy Message Nonce" />
          <div className="flex gap-1 py-2 text-sm sm:text-base">
            <p><span className={cn('font-medium', m.destination_timestamp === null ? 'text-theme-purple' : 'text-theme-green-foreground')}>{m.destination_timestamp === null ? 'Sent' : 'Received'}</span> <span className="opacity-50">{timeSince}</span></p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 rounded-lg">
          <div className="flex flex-row-reverse sm:flex-col justify-between sm:justify-center items-start sm:items-center sm:text-center">
            <p className="text-md">{sourceChainDisplayName}</p>
            <p className="opacity-50">Source Chain</p>
          </div>
          <div className="flex flex-row-reverse sm:flex-col justify-between sm:justify-center items-start sm:items-center sm:text-center">
            <p className="text-md">{destChainDisplayName}</p>
            <p className="opacity-50">Destination Chain</p>
          </div>
          <div className="flex flex-row-reverse sm:flex-col justify-between sm:justify-center items-start sm:items-center sm:text-center">
            <p className="text-md">{typeDisplayName}</p>
            <p className="opacity-50">App Name</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !messages) {
    return <>{Array.from({ length: NUM_OF_MESSAGES }, (_, i) => <Skeleton key={i} className="w-full h-[192px] bg-transparent animate-none" />)}</>
  }

  return <>{messages.map(formatMessage)}</>
}

export default Messages

function ArrowRight() {
  return (
    <svg className="opacity-80 w-4 h-auto" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}