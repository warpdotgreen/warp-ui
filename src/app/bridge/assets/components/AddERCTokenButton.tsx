import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useWalletInfo } from "@web3modal/wagmi/react"
import { useAccount, useSwitchChain } from "wagmi"
import { wagmiConfig } from "../../config"

function AddERCTokenButton({ tokenAddress, tokenChainId, className }: { tokenAddress: string, tokenChainId: number | undefined, className?: string }) {
  const { walletInfo } = useWalletInfo()
  const { chainId: currentUserChain } = useAccount()
  const { switchChainAsync } = useSwitchChain({ config: wagmiConfig })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const switchToCorrectChain = async (tokenChainId: number) => {
    await switchChainAsync({ chainId: tokenChainId })
  }

  const addToken = async () => {
    try {

      if (tokenChainId && currentUserChain !== tokenChainId) {
        await switchToCorrectChain(tokenChainId)
      }

      const wasAdded = await window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
            },
          },
        })
      if (wasAdded) {
        toast.success(`Successfully added token to your wallet`, { id: "added-erc-token-success" })
      } else {
        throw new Error('Add token action unsuccessful')
      }
    } catch (error) {
      toast.error(`Failed to add token to your wallet`, { id: "added-erc-token-failed" })
    }
  }


  const handleClick = async () => {
    try {
      setIsLoading(true)
      await addToken()
    } finally {
      setIsLoading(false)
    }
  }

  if (!Boolean(walletInfo)) return <></>

  return (
    <Button disabled={isLoading} onClick={handleClick} variant="ghost" className={cn('ml-auto hidden sm:block', className)}><span className={cn(isLoading && 'animate-pulse')}>{isLoading ? 'Confirm in Wallet' : '+ Add to Wallet'}</span></Button>
  )
}

export default AddERCTokenButton