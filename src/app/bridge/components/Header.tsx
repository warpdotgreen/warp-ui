import WalletModal from "../WalletModal/WalletModal"
import TopBanner from "./TopBanner"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <h1 className="text-green-500 text-xl sm:text-2xl font-normal pt-1">warp.green<br />bridge interface</h1>
        <WalletModal />
      </header>
    </>
  )
}

export default Header