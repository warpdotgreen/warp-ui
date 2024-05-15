"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

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
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_WATCHER_API_ROOT}stats`).then(res => res.json())
  })

  if (isLoading || !data) return (
    <div className="relative z-10 bg-accent border rounded-md min-h-40 flex gap-4 p-2 justify-between overflow-hidden">
      <Skeleton className="w-full bg-accent" />
    </div>
  )

  return (
    <div className="relative z-10 bg-accent border rounded-md min-h-40 flex gap-4 p-2 justify-between overflow-hidden">
      <div className="px-4 flex flex-col my-4 w-full">
        <p className="text-xl">Messages Delivered</p>
        <div className="mt-auto text-sm sm:text-base animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="opacity-80">{formatNumber(data.messages_to_chia)} to Chia</p>
          <p className="opacity-80">{formatNumber(data.messages_from_chia)} from Chia</p>
        </div>
      </div>
      <div className="absolute bottom-3 right-2 px-4 flex items-end animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-7xl sm:text-9xl font-light">{formatNumber(data.total_messages)}</p>
      </div>
    </div>
  )
}

export default MessagesDelivered