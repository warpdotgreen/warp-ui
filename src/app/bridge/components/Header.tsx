"use client"
import Image from "next/image"
import WalletModal from "../WalletModal/WalletModal"
import TopBanner from "./TopBanner"
import EthereumWalletButton from "../EthereumWalletButton"
import MobileNav from "./Nav/MovileNav"
import DesktopNav from "./Nav/DesktopNav"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="grid grid-cols-2 xl:grid-cols-3 items-center px-4 sm:px-8 py-4">
        <Image src="/warp-green-logo.png" className="h-auto aspect-auto w-36" alt="warp.green logo" width={837} height={281} />

        <div className="xl:hidden flex justify-end">
          <MobileNav />
        </div>

        <div className="hidden xl:flex justify-center">
          <DesktopNav />
        </div>

        {/* Desktop Menu */}
        <div className="hidden xl:flex gap-2 min-w-[335px] justify-end">
          <EthereumWalletButton />
          <WalletModal />
        </div>
      </header>
    </>
  )
}

export default Header