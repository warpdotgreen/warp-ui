"use client"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from 'date-fns'
import { NETWORKS, WATCHER_API_ROOT } from "../bridge/config"
import { cn, getChainIcon } from "@/lib/utils"
import { CopyableLongHexString } from "@/components/CopyableHexString"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"


export interface MessageResponse {
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

export const typeToDisplayName = new Map([
  ["cat_bridge", "CAT Bridge"],
  ["erc20_bridge", "ERC-20 Bridge"],
])

const NUM_OF_MESSAGES = 12

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
      <div key={m.id} className={cn("rounded-md mb-2 w-full py-[18px] px-4 bg-accent/50 hover:bg-accent/90 transition-colors border z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-0", i + 1 > 4 && '')}>
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

  const [scrollPercentage, setScrollPercentage] = useState(0)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollPercentage(scrolled)
    }
  }

  if (isLoading || !messages) {
    return <></>
  }

  return (
    <div className="relative w-full h-full group overflow-hidden">
      <ScrollArea onScrollCapture={handleScroll} className="max-h-full flex flex-col gap-4 h-full w-full p-3 overflow-y-scroll no-scrollbar">
        {messages.map(formatMessage)}
        <Button variant="outline" className="w-full py-4" asChild>
          <Link href="/explorer">See more</Link>
        </Button>
      </ScrollArea>
      <div className={cn(scrollPercentage > 10 && 'group-hover:opacity-100', "opacity-0 absolute top-0 pointer-events-none rounded-xl transition-opacity left-0 bg-gradient-to-b from-accent h-24 z-50 w-full")}></div>
      <div className={cn(scrollPercentage < 90 && 'group-hover:opacity-100', "sticky bottom-0 pointer-events-none rounded-xl transition-opacity opacity-0 left-0 bg-gradient-to-t from-accent h-24 z-50 w-full")}></div>
    </div>
  )
}

export default Messages