import ChiaWalletModal from "../ChiaWalletModal"
import EthereumWalletButton from "../EthereumWalletButton"
import TopBanner from "./TopBanner"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex justify-between px-8 py-4 border-b border-zinc-700 bg-zinc-950">

        <div className="text-zinc-300 text-2xl font-normal pt-1">Bridging Interface</div>

        <div className="hidden sm:flex">
          <EthereumWalletButton />
          <ChiaWalletModal />
        </div>

      </header>
    </>
  )
}

export default Header