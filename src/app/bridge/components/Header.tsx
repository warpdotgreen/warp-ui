import ChiaWalletModal from "../ChiaWalletModal"
import EthereumWalletButton from "../EthereumWalletButton"
import TopBanner from "./TopBanner"

function Header() {
  return (
    <>
      <TopBanner />
      <header className="flex justify-center sm:justify-between px-8 py-4">

        <h1 className="text-green-500 text-2xl font-normal pt-1">warp.green bridge</h1>

        <div className="hidden sm:flex">
          <EthereumWalletButton />
          <ChiaWalletModal />
        </div>

      </header>
    </>
  )
}

export default Header