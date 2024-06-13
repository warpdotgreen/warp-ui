"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Lock } from "lucide-react"
import { WATCHER_API_ROOT } from "../bridge/config"

interface StatsResponse {
  total_messages: number
  messages_to_chia: number
  messages_from_chia: number
  milliETH_total_volume: number
  milliETH_locked: number
  XCH_total_volume: number
  XCH_locked: number
  USDT_total_volume: number
  USDT_locked: number
  DBX_total_volume: number
  DBX_locked: number
}

const liveAppsConfig = [
  {
    name: "ERC-20 Bridge",
    tokens: [
      {
        symbol: "USDC",
        accessorPrefixKey: "USDC",
        decimals: 3
      },
      {
        symbol: "ETH",
        accessorPrefixKey: "milliETH",
        decimals: 6
      },
      {
        symbol: "USDT",
        accessorPrefixKey: "USDT",
        decimals: 3
      }
    ]
  },
  {
    name: "CAT Bridge",
    tokens: [
      {
        symbol: "XCH",
        accessorPrefixKey: "XCH",
        decimals: 12
      },
      {
        symbol: "HOA",
        accessorPrefixKey: "HOA",
        decimals: 3
      },
      {
        symbol: "DBX",
        accessorPrefixKey: "DBX",
        decimals: 3
      },
      {
        symbol: "SBX",
        accessorPrefixKey: "SBX",
        decimals: 3
      }
    ]
  }
]

const formatNumber = (num: number, decimals: number) => {
  let number = num
  if (!num) number = 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: "compact"
  }).format(number / Math.pow(10, decimals))
}

function LiveApps({ appIndex = 0 }: { appIndex: number }) {
  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ['landingPage_stats'],
    queryFn: () => fetch(`${WATCHER_API_ROOT}stats`).then(res => res.json())
  })


  if (isLoading || !data) return <div className="h-full min-h-[350px]"></div>


  const getTokenTableRow = (token: typeof liveAppsConfig[0]["tokens"][0]) => {
    const lockedValue = formatNumber(data[`${token.accessorPrefixKey}_locked` as keyof StatsResponse], token.decimals)
    const volumeValue = formatNumber(data[`${token.accessorPrefixKey}_total_volume` as keyof StatsResponse], token.decimals)
    return (
      <tr className="border-b last:border-0" key={token.accessorPrefixKey}>
        <td className="text-center py-2">
          <p className="text-xl">{lockedValue} {token.symbol}</p>
          <p className="opacity-50">Locked</p>
        </td>
        <td className="text-center">
          <div>
            <p className="text-xl">{volumeValue} {token.symbol}</p>
            <p className="opacity-50">Total Volume</p>
          </div>
        </td>
      </tr>
    )
  }

  const formatApp = (app: typeof liveAppsConfig[0]) => {
    return (
      <div key={app.name} className="w-full h-full p-6">
        <p className="text-xl mb-4 text-center">{app.name}</p>
        <table className="w-full py-2 h-[calc(100%-2rem)]">
          <tbody>
            {app.tokens.map(getTokenTableRow)}
          </tbody>
        </table>
      </div>
    )
  }



  return <>{formatApp(liveAppsConfig[appIndex])}</>
}

export default LiveApps
