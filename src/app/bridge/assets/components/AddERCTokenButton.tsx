import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useWalletInfo } from "@web3modal/wagmi/react"

function AddERCTokenButton({ tokenAddress, className }: { tokenAddress: string, className?: string }) {
  const { walletInfo } = useWalletInfo()
  const [isLoading, setIsLoading] = useState<boolean>(false)


  const addToken = async () => {
    try {
      const wasAdded = await window.ethereum
        .request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: "0x092bA3a8CbF8126255E83f3D548085F9FB87F5C8",
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