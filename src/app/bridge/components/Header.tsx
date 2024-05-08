import Image from "next/image"
import WalletModal from "../WalletModal/WalletModal"
import TopBanner from "./TopBanner"
import EthereumWalletButton from "../EthereumWalletButton"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Image src="/warp-green-logo.png" className="h-auto aspect-auto w-36" alt="warp.green logo" width={837} height={281} />
        <div className="flex gap-2">
          <EthereumWalletButton />
          <WalletModal />
        </div>
      </header>
    </>
  )
}

export default Header