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

function TokenRow({ token, tokenInfo }: { token: any, tokenInfo: any }) {
  const isSourceChainCoinset = token.sourceNetworkType === "coinset" ? true : false

  const sourceChainName = getNetworkDisplayName(isSourceChainCoinset ? tokenInfo.coinsetNetworkId : tokenInfo.evmNetworkId)
  const sourceChainIcon = getChainIcon(sourceChainName)
  const sourceChainTokenAddr = isSourceChainCoinset ? tokenInfo.assetId : tokenInfo.contractAddress

  const destChainName = getNetworkDisplayName(isSourceChainCoinset ? tokenInfo.evmNetworkId : tokenInfo.coinsetNetworkId)
  const destChainIcon = getChainIcon(destChainName)
  const destChainTokenAddr = isSourceChainCoinset ? tokenInfo.contractAddress : tokenInfo.assetId

  const tokenSymbol = token.symbol === 'ETH' ? 'milliETH' : token.symbol

  return (
    <div className='bg-accent border p-2 rounded-md flex flex-col gap-2'>
      <div className='flex flex-col p-4 pb-0 bg-accent rounded-md'>
        <div className='flex gap-4 items-center w-full'>
          {withToolTip(sourceChainIcon, `${sourceChainName} Chain`)}
          <p className='text-xl font-light'>{tokenSymbol}</p>
          <Button variant="ghost" className='ml-auto'>+ Add to Wallet</Button>
        </div>
        <p className='opacity-80 ml-10 bg-accent border w-fit px-2 py-0.5 text-sm rounded text-primary/80'>{`${sourceChainTokenAddr.slice(0, 6)}...${sourceChainTokenAddr.slice(-4)}`}</p>
      </div>


      <DownArrowIcon />

      <div className='flex flex-col p-4 bg-background rounded-md'>
        <div className='flex gap-4 items-center w-full'>
          {withToolTip(destChainIcon, `${destChainName} Chain`)}
          <p className='text-xl font-light'>{sourceChainName} Warped milliETH</p>
          <Button variant="ghost" className='ml-auto'>+ Add to Wallet</Button>
        </div>
        <p className='opacity-80 ml-10 bg-accent w-fit px-2 py-0.5 text-sm rounded text-primary/80'>{`${destChainTokenAddr.slice(0, 6)}...${destChainTokenAddr.slice(-4)}`}</p>
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
          <TokenRow key={`${token.symbol}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} />
        )))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-light">Supported CAT Assets</h2>
      <div className='grid grid-cols-2 gap-4'>
        {coinsetTokens.map(token => token.supported.map(tokenInfo => {
          if (tokenInfo.evmNetworkId === "bse") return // Skip bse as eth tokens are native
          return <TokenRow key={`${token.symbol}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} />
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

  return (
    <div
      className={`flex items-center gap-2 ${isCopied ? '' : 'cursor-pointer'}`}
      onClick={isCopied ? () => { } : handleCopy}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
    >
      {displayText}
      {isCopied ? <CopySuccessIcon /> : <ClipboardIcon />}
    </div>
  )
}

// https://heroicons.com/
function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  )
}


// https://heroicons.com/
function CopySuccessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function DownArrowIcon() {
  return (
    <svg className='ml-[15px] -mt-8 translate-y-5 bg-accent rounded-full p-1 opacity-80 w-6 h-auto' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}
