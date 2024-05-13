import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWallet } from "../../ChiaWalletManager/WalletContext"
import { type addCATParams } from "../../ChiaWalletManager/wallets/types"
import { cn } from "@/lib/utils"

function AddCATButton({ params }: { params: addCATParams }) {
  const { walletConnected, addCAT } = useWallet()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      await addCAT(params)
    } finally {
      setIsLoading(false)
    }
  }

  if (!walletConnected) return <></>

  return (
    <Button disabled={isLoading} onClick={handleClick} variant="ghost" className='ml-auto hidden sm:block'><span className={cn(isLoading && 'animate-pulse')}>{isLoading ? 'Confirm in Wallet' : '+ Add to Wallet'}</span></Button>
  )
}

export default AddCATButton