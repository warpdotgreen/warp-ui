import { TESTNET } from "../config"

function TopBanner() {

  if (TESTNET) {
    return (
      <div className="bg-destructive text-center w-full py-2 px-4 font-light">
        <p>This is a testnet interface. Do not use mainnet funds. Make sure Goby is on <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">testnet11</span> and your Ethereum wallet is on <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">Sepolia</span> or <span className="bg-theme-purple rounded-sm px-2 whitespace-nowrap">Base Sepolia</span>.</p>
      </div>
    )
  }
  return <></>
}

export default TopBanner