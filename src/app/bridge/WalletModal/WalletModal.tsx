"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import ChiaWalletButtons from "../ChiaWalletButtons"
import EthereumWalletButton from "../EthereumWalletButton"
import { Button } from "@/components/ui/button"
import { useWallet } from "../ChiaWalletManager/WalletContext"

function WalletModal() {
  const { walletConnected } = useWallet()
  const buttonTrigger = !walletConnected
    ?
    <Button variant="theme">Connect Wallet</Button>
    :
    <Avatar className="hover:opacity-80 bg-muted cursor-pointer"></Avatar>

  return (
    <Dialog>
      <DialogTrigger asChild>
        {buttonTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect a wallet for Chia & Ethereum chains
          </DialogDescription>
        </DialogHeader>

        <p className="-mb-1">Chia</p>
        <ChiaWalletButtons />

        <p className="-mb-1">Ethereum</p>
        <EthereumWalletButton />

      </DialogContent>
    </Dialog>

  )
}

export default WalletModal