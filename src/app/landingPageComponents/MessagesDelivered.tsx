"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { WATCHER_API_ROOT } from "../bridge/config"

interface StatsResponse {
  total_messages: number
  messages_to_chia: number
  messages_from_chia: number
}

const formatNumber = (num: number) => {
  let number = num
  if (!num) number = 0
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumSignificantDigits: 3 }).format(number)
}

function MessagesDelivered() {


  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ['landingPage_stats'],
    queryFn: () => fetch(`${WATCHER_API_ROOT}stats`).then(res => res.json())
  })

  if (isLoading || !data) return (
    <div className="relative z-10 bg-accent/50 border rounded-md min-h-40 flex gap-4 p-2 justify-between overflow-hidden">
      <Skeleton className="w-full bg-transparent" />
    </div>
  )

  return (
    <div className="rounded-lg border p-6 h-full bg-accent/50 hover:bg-accent/90 transition-colors flex flex-col">
      <p className="text-center text-xl">Stats</p>
      <div className="flex flex-col mt-6 mx-4 pb-2">
        <div className="flex flex-col justify-center items-center pb-4 border-b">
          <div className="text-7xl font-light">{formatNumber(data.total_messages)}</div>
          <div className="text-lg opacity-50">delivered messages</div>
        </div>

        <div className="flex w-full rounded-lg">
          <div className="flex-1 flex flex-col justify-left py-4 items-center">
            <div className="text-2xl">{formatNumber(data.messages_to_chia)}</div>
            <div className="text-lg opacity-50">to Chia</div>
          </div>

          <div className="flex-1 flex flex-col justify-left py-4 items-center">
            <div className="text-2xl">{formatNumber(data.messages_from_chia)}</div>
            <div className="text-lg opacity-50">from Chia</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesDelivered
