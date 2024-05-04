import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ChiaWalletButtons from "../ChiaWalletButtons"
import EthereumWalletButton from "../EthereumWalletButton"


function WalletModal() {
  return (
    <Dialog>
      <DialogTrigger>Connect Wallet</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect a wallet for Chia & Ethereum chains
          </DialogDescription>
        </DialogHeader>

        <p className="border-b">Chia</p>
        <ChiaWalletButtons />

        <p className="border-b">Ethereum</p>
        <EthereumWalletButton />

      </DialogContent>
    </Dialog>

  )
}

export default WalletModal