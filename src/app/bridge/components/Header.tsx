import Image from "next/image"
import WalletModal from "../WalletModal/WalletModal"
import TopBanner from "./TopBanner"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Image src="/warp-green-logo.png" className="h-24 w-auto" alt="warp.green logo" width={837} height={281} />
        <WalletModal />
      </header>
    </>
  )
}

export default Header