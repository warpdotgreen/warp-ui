import { TESTNET } from "../config"

function TopBanner() {

  if (TESTNET) {
    return (
      <div className="text-yellow-300 bg-destructive text-center w-full py-2 px-4 font-bold">
        <p>This is a testnet interface. Do not use mainnet funds. Make sure Goby is on <span className="text-blue-500">testnet11</span> and your Ethereum wallet is on <span className="text-blue-500">Sepolia</span> or <span className="text-blue-500">Base Sepolia</span>.</p>
      </div>
    )
  }
  return <></>
}

export default TopBanner