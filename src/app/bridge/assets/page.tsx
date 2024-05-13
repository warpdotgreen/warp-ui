"use client"
import { useState } from 'react'
import { NETWORKS, NetworkType, TOKENS } from '../config'
import { BaseIcon, ChiaIcon, ETHIcon } from '../components/Icons/ChainIcons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button'

const withToolTip = (triggerText: any, toolTopContent: string) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger className="rounded-full transition-colors focus-visible:outline-none ring-offset-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{triggerText}</TooltipTrigger>
        <TooltipContent>
          <p>{toolTopContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function useFilteredTokens(networkType: NetworkType) {
  return TOKENS.filter((token) => token.sourceNetworkType === networkType)
}

function getNetworkDisplayName(networkId: string): string {
  const network = NETWORKS.find((network) => network.id === networkId)
  return network?.displayName ?? ''
}

function TokenItem({ token, tokenInfo }: { token: any, tokenInfo: any }) {
  console.log(token)
  const isSourceChainCoinset = token.sourceNetworkType === NetworkType.COINSET

  const sourceChainName = getNetworkDisplayName(isSourceChainCoinset ? tokenInfo.coinsetNetworkId : tokenInfo.evmNetworkId)
  const sourceChainIcon = getChainIcon(sourceChainName)
  const sourceChainTokenAddr = isSourceChainCoinset ? tokenInfo.assetId : tokenInfo.contractAddress

  const destChainName = getNetworkDisplayName(isSourceChainCoinset ? tokenInfo.evmNetworkId : tokenInfo.coinsetNetworkId)
  const destChainIcon = getChainIcon(destChainName)
  const destChainTokenAddr = isSourceChainCoinset ? tokenInfo.contractAddress : tokenInfo.assetId

  const tokenSymbol = token.symbol

  return (
    <div className='bg-accent border p-2 rounded-md flex flex-col gap-2'>
      <div className='flex flex-col p-4 bg-accent rounded-md'>
        <div className='flex gap-4 items-center w-full'>
          {withToolTip(sourceChainIcon, `${sourceChainName} Chain`)}
          <p className='text-xl font-light'>{tokenSymbol}</p>
          {/* <Button variant="ghost" className='ml-auto'>+ Add to Wallet</Button> */}
        </div>
        {/* <p className='opacity-80 ml-10 bg-accent border w-fit px-2 py-0.5 text-sm rounded text-primary/80'>{`${sourceChainTokenAddr.slice(0, 6)}...${sourceChainTokenAddr.slice(-4)}`}</p> */}
      </div>


      <DownArrowIcon />

      <div className='flex flex-col p-4 bg-background rounded-md'>
        <div className='flex gap-4 items-center w-full'>
          {withToolTip(destChainIcon, `${destChainName} Chain`)}
          <p className='text-xl font-light'>{sourceChainName} Warped milliETH</p>
          <Button variant="ghost" className='ml-auto'>+ Add to Wallet</Button>
        </div>
        <CopyableLongHexString hexString={destChainTokenAddr} />
      </div>
    </div>
  )
}

function getChainIcon(chainDisplayName: string) {
  switch (chainDisplayName) {
    case "Ethereum":
      return <ETHIcon className="w-6 h-auto shrink-0" />
    case "Base":
      return <BaseIcon className="w-6 h-auto shrink-0" />
    case "Chia":
      return <ChiaIcon className="w-6 h-auto shrink-0" />
    default:
      console.error("Incorrect chain name")
      return <></>
  }
}



export default function AssetList() {
  const erc20Assets = useFilteredTokens(NetworkType.EVM)
  const coinsetTokens = useFilteredTokens(NetworkType.COINSET)

  return (
    <div className='max-w-5xl mt-12 mx-auto w-full '>
      <h2 className="mb-4 text-xl font-light">Supported ERC-20 Assets</h2>
      <div className='grid grid-cols-2 gap-4'>
        {erc20Assets.map(token => token.supported.map(tokenInfo => (
          <TokenItem key={`${token.symbol}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} />
        )))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-light">Supported CAT Assets</h2>
      <div className='grid grid-cols-2 gap-4'>
        {coinsetTokens.map(token => token.supported.map(tokenInfo => {
          if (tokenInfo.evmNetworkId === "bse") return // Skip bse as eth tokens are native
          return <TokenItem key={`${token.symbol}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} />
        }))}
      </div>

    </div>
  )
}



/*
 *  Icons
*/

function CopyableLongHexString({ hexString }: { hexString: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const displayText = `${hexString.slice(0, 6)}...${hexString.slice(-4)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hexString)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000) // Resets the icon after 3 seconds
  }

  const copyElement = (
    <p className={`opacity-80 select-none hover:opacity-60 ml-10 bg-accent w-fit px-2 py-0.5 text-sm rounded text-primary/80 ${isCopied ? 'opacity-60' : 'cursor-pointer'}`} onClick={isCopied ? () => { } : handleCopy}>
      {isCopied ? 'Copied' : displayText}
    </p>
  )
  if (isCopied) return copyElement

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild className="transition-colors focus-visible:outline-none ring-offset-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {copyElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
  )
}

function DownArrowIcon() {
  return (
    <svg className='ml-[15px] -mt-8 translate-y-5 bg-accent rounded-full p-1 opacity-80 w-6 h-auto' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}
