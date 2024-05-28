"use client"
import { NETWORKS, Network, NetworkType, TOKENS } from '../config'
import { BaseIcon, ChiaIcon, ETHIcon } from '../components/Icons/ChainIcons'
import { addCATParams } from '../ChiaWalletManager/wallets/types'
import AddCATButton from './components/AddCATButton'
import { useSearchParams } from 'next/navigation'
import { cn, withToolTip } from '@/lib/utils'
import AddERCTokenButton from './components/AddERCTokenButton'
import { CopyableLongHexString } from '@/components/CopyableHexString'

function useFilteredTokens(networkType: NetworkType) {
  return TOKENS.filter((token) => token.sourceNetworkType === networkType)
}

function getNetwork(networkId: string): Network | undefined {
  const network = NETWORKS.find((network) => network.id === networkId)
  return network
}

function TokenItem({ token, tokenInfo, highlightedAssets }: { token: any, tokenInfo: any, highlightedAssets: string[] }) {
  const isSourceChainCoinset = token.sourceNetworkType === NetworkType.COINSET

  const sourceChain = getNetwork(isSourceChainCoinset ? tokenInfo.coinsetNetworkId : tokenInfo.evmNetworkId)
  if (!sourceChain) throw new Error('Source chain not found')
  const sourceChainName = sourceChain?.displayName || ''
  const sourceChainIcon = getChainIcon(sourceChainName)
  const sourceChainTokenAddr = isSourceChainCoinset ? tokenInfo.assetId : tokenInfo.contractAddress

  const destChain = getNetwork(isSourceChainCoinset ? tokenInfo.evmNetworkId : tokenInfo.coinsetNetworkId)
  if (!destChain) throw new Error('Destination chain not found')
  const destChainName = destChain.displayName
  const destChainIcon = getChainIcon(destChainName)
  const destChainTokenAddr = isSourceChainCoinset ? tokenInfo.contractAddress : tokenInfo.assetId

  const formattedTokenSymbol = token.symbol === "ETH" ? "milliETH" : token.symbol

  // If source chain type is erc
  const addCATParams: addCATParams = {
    assetId: destChainTokenAddr,
    symbol: `w${formattedTokenSymbol}${sourceChain.id == 'bse' ? '.b' : ''}`,
    logoUrl: 'https://warp.green/warp-green-icon.png'
  }

  return (
    <div className='bg-accent border p-2 rounded-md flex flex-col gap-2'>
      <div className='flex flex-col p-4 bg-accent rounded-md'>
        <div className='flex gap-4 items-center w-full'>
          {withToolTip(sourceChainIcon, sourceChainName)}
          <p className='text-xl font-light'>{token.symbol}</p>
        </div>
      </div>


      <DownArrowIcon />

      <div className={cn('flex flex-col p-4 bg-background border-background border-2 rounded-md', highlightedAssets.includes(destChainTokenAddr) && 'border-theme-purple')}>
        <div className='flex gap-4 items-center w-full -ml-[3px]'>
          {withToolTip(destChainIcon, destChainName)}
          <p className='text-xl font-light'>{sourceChainName} Warped {formattedTokenSymbol}</p>
          {sourceChain.type !== "coinset" ?
            <AddCATButton params={addCATParams} className={cn(highlightedAssets.includes(destChainTokenAddr) && 'bg-theme-purple hover:bg-theme-purple hover:opacity-80 font-light hover:border-theme-purple')} />
            :
            <AddERCTokenButton tokenAddress={destChainTokenAddr} tokenChainId={destChain.chainId} className={cn(highlightedAssets.includes(destChainTokenAddr) && 'bg-theme-purple hover:bg-theme-purple hover:opacity-80 font-light hover:border-theme-purple')} />
          }
        </div>
        <CopyableLongHexString hexString={destChainTokenAddr} className='ml-10' />
        {/* {highlightedAssets.includes(destChainTokenAddr) && <div className='p-2 bg-theme-purple mt-4 rounded-[8px] px-4 font-light flex gap-2'><CircleAlertIcon className='w-4 h-auto shrink-0' />This asset has been flagged for you to add</div>} */}
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
  const searchParams = useSearchParams()
  const addAssetsParam = searchParams.get('addAssets')
  let highlightedAssets: string[] = []
  if (addAssetsParam) {
    highlightedAssets = addAssetsParam.split(',')
  }

  const erc20Assets = useFilteredTokens(NetworkType.EVM)
  const coinsetTokens = useFilteredTokens(NetworkType.COINSET)

  return (
    <div className='max-w-6xl mt-12 mx-auto w-full p-4 xl:p-0 overflow-auto'>
      <h2 className="mb-4 text-xl font-light">Supported ERC-20 Assets</h2>
      {!!highlightedAssets.length && <p className='border rounded-md px-6 py-4 mb-4'>We have flagged assets (with purple) you need to add to your wallet to continue the bridging process</p>}
      <div className='grid xl:grid-cols-2 gap-4'>
        {erc20Assets.map(token => token.supported.map(tokenInfo => (
          <TokenItem key={`${token.symbol}-${tokenInfo.evmNetworkId}-${tokenInfo.coinsetNetworkId}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} highlightedAssets={highlightedAssets} />
        )))}
      </div>

      <h2 className="mb-4 mt-12 text-xl font-light">Supported CAT Assets</h2>
      <div className='grid xl:grid-cols-2 gap-4'>
        {coinsetTokens.map(token => token.supported.map(tokenInfo => {
          return <TokenItem key={`${token.symbol}-${tokenInfo.evmNetworkId}-${tokenInfo.coinsetNetworkId}-${tokenInfo.assetId}`} token={token} tokenInfo={tokenInfo} highlightedAssets={highlightedAssets} />
        }))}
      </div>

    </div>
  )
}

/*
 *  Icons
*/
function DownArrowIcon() {
  return (
    <svg className='ml-[15px] -mt-8 translate-y-5 bg-accent rounded-full p-1 opacity-80 w-6 h-auto' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  )
}
