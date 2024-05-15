"use client"
import { useQuery } from "@tanstack/react-query"
import { Lock } from "lucide-react"

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
        symbol: "ETH",
        accessorPrefixKey: "milliETH",
        decimals: 6
      },
      {
        symbol: "USDC",
        accessorPrefixKey: "USDC",
        decimals: 3
      },
      {
        symbol: "USDT",
        accessorPrefixKey: "USDT",
        decimals: 3
      },
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
        symbol: "SBX",
        accessorPrefixKey: "SBX",
        decimals: 3
      },
      {
        symbol: "DBX",
        accessorPrefixKey: "DBX",
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

function LiveApps() {
  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ['landingPage_stats'],
    queryFn: () => fetch(`${process.env.NEXT_PUBLIC_WATCHER_API_ROOT}stats`).then(res => res.json())
  })


  if (isLoading || !data) return <></>


  const getTokenTableRow = (token: typeof liveAppsConfig[0]["tokens"][0]) => {
    const lockedValue = formatNumber(data[`${token.accessorPrefixKey}_locked` as keyof StatsResponse], token.decimals)
    const volumeValue = formatNumber(data[`${token.accessorPrefixKey}_total_volume` as keyof StatsResponse], token.decimals)
    return (
      <tr>
        <td className="opacity-80 flex gap-2"><Lock className="w-3.5 opacity-80 h-auto" />{lockedValue} {token.symbol}</td>
        <td className="text-right">{volumeValue} {token.symbol} Vol.</td>
      </tr>
    )
  }

  const formatApp = (app: typeof liveAppsConfig[0]) => {
    return (
      <div className="bg-background p-6 rounded-md animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-xl mb-4">{app.name}</p>
        <table className="w-full py-2">
          <tbody>
            {app.tokens.map(getTokenTableRow)}
          </tbody>
        </table>
      </div>
    )
  }

  return <>{liveAppsConfig.map(formatApp)}</>
}

export default LiveApps