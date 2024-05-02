import { TESTNET } from "../config"

function TopBanner() {

  if (TESTNET) {
    return (
      <div className="text-yellow-300 bg-destructive sm:text-center w-full py-2 px-4 font-medium">
        <p>This is a testnet interface. Do not use mainnet funds. Make sure Goby is on <span className="text-blue-800 dark:text-blue-300">testnet11</span> and your Ethereum wallet is on <span className="text-blue-800 dark:text-blue-300">Sepolia</span> or <span className="text-blue-800 dark:text-blue-300">Base Sepolia</span>.</p>
      </div>
    )
  }
  return <></>
}

export default TopBanner